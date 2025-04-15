from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, constr
from typing import List, Optional
from uuid import UUID
from app.models.decision import DecisionChatSession
from app.models.reflection import DecisionChatMessage
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
import uuid
import datetime

router = APIRouter()

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
def create_decision_session(session_in: DecisionSessionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = DecisionChatSession(
        id=uuid.uuid4(),
        user_id=current_user.id,
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
def list_decision_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(DecisionChatSession).filter(DecisionChatSession.user_id == current_user.id).all()

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

@router.post("/sessions/{session_id}/messages", response_model=DecisionMessageOut, status_code=201)
def create_decision_message(session_id: str, message_in: DecisionMessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Create a new message in a decision chat session.
    """
    import uuid
    # Convert session_id to UUID
    try:
        session_uuid = uuid.UUID(session_id)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=422, detail="Invalid session_id format")
    # Check session ownership
    session = db.query(DecisionChatSession).filter_by(id=session_uuid, user_id=current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    # Reason: Enum conversion for sender
    from app.models.reflection import MessageType
    try:
        sender_enum = MessageType[message_in.sender]
    except KeyError:
        raise HTTPException(status_code=422, detail="Invalid sender type")
    message = DecisionChatMessage(
        id=uuid.uuid4(),
        session_id=session_uuid,
        sender=sender_enum,
        content=message_in.content,
        created_at=datetime.datetime.utcnow()
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

@router.get("/sessions/{session_id}/messages", response_model=List[DecisionMessageOut])
def list_decision_messages(session_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    List all messages for a given decision chat session.
    """
    import uuid
    try:
        session_uuid = uuid.UUID(session_id)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=422, detail="Invalid session_id format")
    session = db.query(DecisionChatSession).filter_by(id=session_uuid, user_id=current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return db.query(DecisionChatMessage).filter_by(session_id=session_uuid).order_by(DecisionChatMessage.created_at).all()

@router.patch("/sessions/{session_id}", response_model=DecisionSessionOut)
def update_decision_session(session_id: str, session_update: DecisionSessionUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Update a decision chat session (status, summary, insights, completed_at).
    """
    import uuid
    try:
        session_uuid = uuid.UUID(session_id)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=422, detail="Invalid session_id format")
    session = db.query(DecisionChatSession).filter_by(id=session_uuid, user_id=current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session_update.status:
        # Reason: Validate status against enum
        from app.models.decision import SessionStatus
        try:
            session.status = SessionStatus[session_update.status]
        except KeyError:
            raise HTTPException(status_code=422, detail="Invalid status value")
    if session_update.summary is not None:
        session.summary = session_update.summary
    if session_update.insights is not None:
        session.insights = session_update.insights
    if session_update.completed_at is not None:
        session.completed_at = session_update.completed_at
    db.commit()
    db.refresh(session)
    return session

# Endpoints for deleting sessions/messages can be added as needed.
