from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field, constr
from app.models.decision import DecisionChatSession, DecisionJournalEntry
from app.models.reflection import DecisionChatMessage
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.auto_tagger import OpenAITagger
from app.schemas.decision_journal import (
    DecisionJournalEntryCreate,
    DecisionJournalEntryUpdate,
    DecisionJournalEntryOut,
)
import uuid
import datetime

router = APIRouter()


import logging
import traceback


@router.post("/journal", response_model=DecisionJournalEntryOut, status_code=201)
def create_decision_journal_entry(
    entry_in: DecisionJournalEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new decision journal entry for the authenticated user.
    """
    try:
        tag_result = OpenAITagger.tag_entry(entry_in.title, entry_in.context)
        entry = DecisionJournalEntry(
            id=str(uuid.uuid4()),
            user_id=str(current_user.id),
            title=entry_in.title,
            context=entry_in.context,
            anticipated_outcomes=entry_in.anticipated_outcomes,
            values=entry_in.values,
            domain_tags=tag_result["domain_tags"],
            sentiment_tag=tag_result["sentiment_tag"],
            keywords=tag_result["keywords"],
            created_at=datetime.datetime.utcnow(),
            updated_at=datetime.datetime.utcnow(),
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry
    except HTTPException as http_exc:
        logging.error(
            f"[ERROR] create_decision_journal_entry HTTPException: {http_exc.detail}"
        )
        raise
    except Exception as e:
        logging.error(
            f"[ERROR] create_decision_journal_entry failed: {e}\n{traceback.format_exc()}"
        )
        raise HTTPException(
            status_code=503, detail="Internal server error (journal creation)"
        )


class DecisionMessageCreate(BaseModel):
    content: str
    sender: str = Field(..., pattern="^(user|ai)$")


class DecisionSessionCreate(BaseModel):
    title: constr(min_length=1)


class DecisionSessionOut(BaseModel):
    id: UUID
    title: Optional[str]
    started_at: datetime.datetime
    completed_at: Optional[datetime.datetime]
    status: str
    summary: Optional[str]
    insights: Optional[str]

    class Config:
        orm_mode = True


@router.post("/sessions", response_model=DecisionSessionOut, status_code=201)
def create_decision_session(
    session_in: DecisionSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = DecisionChatSession(
        id=str(uuid.uuid4()),
        user_id=str(current_user.id),
        title=session_in.title,
        started_at=datetime.datetime.utcnow(),
        status="context_gathering",
        summary=None,
        insights=None,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/sessions", response_model=List[DecisionSessionOut])
def list_decision_sessions(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return (
        db.query(DecisionChatSession)
        .filter(DecisionChatSession.user_id == current_user.id)
        .all()
    )


class DecisionMessageOut(BaseModel):
    id: UUID
    session_id: UUID
    sender: str
    content: str
    created_at: datetime.datetime

    class Config:
        orm_mode = True


class DecisionSessionUpdate(BaseModel):
    status: Optional[str] = None
    summary: Optional[str] = None
    insights: Optional[str] = None
    completed_at: Optional[datetime.datetime] = None


@router.post(
    "/sessions/{session_id}/messages",
    response_model=DecisionMessageOut,
    status_code=201,
)
def create_decision_message(
    session_id: str,
    message_in: DecisionMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new message in a decision chat session.
    """
    import uuid

    print(
        f"[DEBUG] create_decision_message: session_id={session_id}, user_id={getattr(current_user, 'id', None)}"
    )
    # Convert session_id to UUID
    try:
        session_uuid = uuid.UUID(session_id)
    except (ValueError, AttributeError):
        print("[DEBUG] Invalid session_id format")
        raise HTTPException(status_code=422, detail="Invalid session_id format")
    # Print all sessions for current user
    all_sessions = (
        db.query(DecisionChatSession).filter_by(user_id=str(current_user.id)).all()
    )
    print(
        f"[DEBUG] create_decision_message: all sessions for user {current_user.id}: {[{'id': s.id, 'user_id': s.user_id} for s in all_sessions]}"
    )
    # Check session ownership
    session = (
        db.query(DecisionChatSession)
        .filter_by(id=str(session_uuid), user_id=str(current_user.id))
        .first()
    )
    print(f"[DEBUG] create_decision_message: session query result: {session}")
    if not session:
        print(
            f"[DEBUG] Session not found for id={session_id}, user_id={getattr(current_user, 'id', None)}"
        )
        raise HTTPException(status_code=404, detail="Session not found")
    # Reason: Enum conversion for sender
    from app.models.reflection import MessageType

    try:
        sender_enum = MessageType[message_in.sender]
    except KeyError:
        print(f"[DEBUG] Invalid sender type: {message_in.sender}")
        raise HTTPException(status_code=422, detail="Invalid sender type")
    message = DecisionChatMessage(
        id=str(uuid.uuid4()),
        session_id=str(session_uuid),
        sender=sender_enum,
        content=message_in.content,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    print(f"[DEBUG] Message created: {message}")
    return message


@router.get("/sessions/{session_id}/messages", response_model=List[DecisionMessageOut])
def list_decision_messages(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all messages for a given decision chat session.
    """
    import uuid

    try:
        session_uuid = uuid.UUID(session_id)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=422, detail="Invalid session_id format")
    session = (
        db.query(DecisionChatSession)
        .filter_by(id=str(session_uuid), user_id=str(current_user.id))
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return (
        db.query(DecisionChatMessage)
        .filter_by(session_id=str(session_uuid))
        .order_by(DecisionChatMessage.created_at)
        .all()
    )


@router.patch("/sessions/{session_id}", response_model=DecisionSessionOut)
def update_decision_session(
    session_id: str,
    session_update: DecisionSessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update a decision chat session (status, summary, insights, completed_at).

    Args:
        session_id (str): The session UUID (as string).
        session_update (DecisionSessionUpdate): The update payload.
        db (Session): SQLAlchemy session dependency.
        current_user (User): The authenticated user.

    Returns:
        DecisionChatSession: The updated session object.

    Raises:
        HTTPException: If session_id is invalid, session not found, or status is invalid.
    """
    import uuid

    print(
        f"[DEBUG] update_decision_session: session_id={session_id}, user_id={getattr(current_user, 'id', None)}"
    )
    try:
        session_uuid = uuid.UUID(session_id)
    except (ValueError, AttributeError):
        print("[DEBUG] Invalid session_id format")
        raise HTTPException(status_code=422, detail="Invalid session_id format")
    # Print all sessions for current user
    all_sessions = (
        db.query(DecisionChatSession).filter_by(user_id=str(current_user.id)).all()
    )
    print(
        f"[DEBUG] update_decision_session: all sessions for user {current_user.id}: {[{'id': s.id, 'user_id': s.user_id} for s in all_sessions]}"
    )
    session = (
        db.query(DecisionChatSession)
        .filter_by(id=str(session_uuid), user_id=str(current_user.id))
        .first()
    )
    print(f"[DEBUG] update_decision_session: session query result: {session}")
    if not session:
        print(
            f"[DEBUG] Session not found for id={session_id}, user_id={getattr(current_user, 'id', None)}"
        )
        raise HTTPException(status_code=404, detail="Session not found")
    if session_update.status:
        # Reason: Validate status against enum (only allow valid SessionStatus values)
        from app.models.decision import SessionStatus

        try:
            session.status = SessionStatus[session_update.status]
        except KeyError:
            print(f"[DEBUG] Invalid status value: {session_update.status}")
            raise HTTPException(status_code=422, detail="Invalid status value")
    if session_update.summary is not None:
        session.summary = session_update.summary
    if session_update.insights is not None:
        session.insights = session_update.insights
    if session_update.completed_at is not None:
        session.completed_at = session_update.completed_at
    db.commit()
    db.refresh(session)
    print(f"[DEBUG] update_decision_session: updated session: {session}")
    return session


# --- DecisionJournalEntry: List & Update Endpoints ---


@router.get("/journal", response_model=List[DecisionJournalEntryOut])
def list_decision_journal_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all decision journal entries for the authenticated user.

    Args:
        db (Session): SQLAlchemy session dependency.
        current_user (User): The authenticated user.

    Returns:
        List[DecisionJournalEntry]: All entries for user.
    """
    return (
        db.query(DecisionJournalEntry)
        .filter(DecisionJournalEntry.user_id == str(current_user.id))
        .order_by(DecisionJournalEntry.created_at.desc())
        .all()
    )


@router.patch("/journal/{entry_id}", response_model=DecisionJournalEntryOut)
def update_decision_journal_entry(
    entry_id: str,
    entry_update: DecisionJournalEntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update a decision journal entry (partial update).

    Args:
        entry_id (str): The entry UUID (as string).
        entry_update (DecisionJournalEntryUpdate): The update payload.
        db (Session): SQLAlchemy session dependency.
        current_user (User): The authenticated user.

    Returns:
        DecisionJournalEntry: The updated entry.

    Raises:
        HTTPException: If entry_id is invalid or entry not found.
    """
    import uuid

    try:
        entry_uuid = uuid.UUID(entry_id)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=422, detail="Invalid entry_id format")
    entry = (
        db.query(DecisionJournalEntry)
        .filter_by(id=str(entry_uuid), user_id=str(current_user.id))
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    # Update only provided fields
    data = entry_update.dict(exclude_unset=True)
    for field, value in data.items():
        setattr(entry, field, value)
    # Re-run auto-tagging if title or context is updated
    if "title" in data or "context" in data:
        tag_result = OpenAITagger.tag_entry(
            data.get("title", entry.title), data.get("context", entry.context)
        )
        entry.domain_tags = tag_result["domain_tags"]
        entry.sentiment_tag = tag_result["sentiment_tag"]
        entry.keywords = tag_result["keywords"]
    entry.updated_at = datetime.datetime.utcnow()  # Reason: always update timestamp
    db.commit()
    db.refresh(entry)
    return entry


# Endpoints for deleting sessions/messages/entries can be added as needed.
