package handler

import "music_system/model"

type FindUserReq struct{}
type FindUserResp struct {
	user model.User
}

type LoginReq struct {
	Account  string `json:"account"`
	Password string `json:"password"`
}

type RegisterReq struct {
	Account  string `gorm:"type:text" json:"account"`
	Password string `gorm:"type:text" json:"password"`
	Email    string `gorm:"type:text" json:"email"`
}

type ListUserReq struct{}
type ListUserResp struct{}

type CreateUserReq struct {
}
type CreateUserResp struct{}

type UpdateUserReq struct{}
type UpdateUserResp struct{}

type DeleteUserReq struct{}
type DeleteUserResp struct{}
