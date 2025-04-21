from fastapi import APIRouter, HTTPException

from modules.message_schema import MessageActiveUpdate, MessageCreate, MessageResponse
from modules.user.error_response_schema import ErrorResponse
from core.dependencies import DBSessionDep
from operations.message_operations import MessageOperations


message_router = APIRouter(
    prefix="/api/v1/messages",
    tags=["messages"]
)

# Create a message
@message_router.post("", response_model=MessageResponse, responses={
    500: {"model": ErrorResponse},
    400: {"model": ErrorResponse}
})
async def create_message(message: MessageCreate, db_session: DBSessionDep) -> MessageResponse:
    message_ops = MessageOperations(db_session)
    return await message_ops.create_message(message)

# Update "hasActiveMessage" attribute on a message
@message_router.put("/{message_id}", response_model=MessageResponse, responses={
    500: {"model": ErrorResponse},
    404: {"model": ErrorResponse}
})
async def update_hasActiveMessage_boolean(message_id: int, message_update: MessageActiveUpdate, db_session: DBSessionDep) -> MessageResponse:
    message_ops = MessageOperations(db_session)
    return await message_ops.update_hasActiveMessage_boolean(message_id, message_update)
