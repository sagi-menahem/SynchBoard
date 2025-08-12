export interface BoardUpdateDTO {
    updateType: 'DETAILS_UPDATED' | 'MEMBERS_UPDATED';
    sourceUserEmail: string;
}

export interface UserUpdateDTO {
    updateType: 'BOARD_LIST_CHANGED' | 'BOARD_DETAILS_CHANGED';
}
