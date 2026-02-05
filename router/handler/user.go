package handler

type RegisterReq struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Nickname string `json:"nickname"`
}

type LoginReq struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResp struct {
	Token    string `json:"token"`
	ID       string `json:"id"`
	Username string `json:"username"`
	Nickname string `json:"nickname"`
	Role     string `json:"role"`
	Avatar   string `json:"avatar"`
}

type UserUpdateReq struct {
	ID       string `json:"id" binding:"required"`
	Nickname string `json:"nickname"`
	Avatar   string `json:"avatar"`
}
