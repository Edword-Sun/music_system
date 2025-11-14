package handler

import (
	"music_system/model"
)

type FindUserReq struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Account  string `json:"account"`
	Password string `json:"password"`
	Email    string `json:"email"`

	Auth int `son:"auth"` // 0: 超级管理员 1: 普通管理员 2: 超级用户 3: 普通用户...

}
type FindUserResp struct {
	Data model.User
}

type ListUserReq struct {
	IDs       []string `json:"ids"`
	Names     []string `json:"names"`
	Accounts  []string `json:"accounts"`
	Passwords []string `json:"passwords"`
	Emails    []string `json:"emails"`

	Page int `json:"page"`
	Size int `json:"size"`

	StartTime int64 `json:"start_time"`
	EndTime   int64 `json:"end_time"`
}
type ListUserResp struct {
	Total int64         `json:"total"`
	Data  []*model.User `json:"data"`
}

type LoginReq struct {
	Account  string `json:"account"`
	Password string `json:"password"`
}

type RegisterReq struct {
	Account  string `json:"account"`
	Password string `json:"password"`
	Email    string `json:"email"`
}

type CreateUserReq struct {
	Name     string `json:"name"`
	Account  string `json:"account"`
	Password string `json:"password"`
	Email    string `json:"email"`
}
type CreateUserResp struct {
	ID string `json:"id"`
}

type UpdateUserReq struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Account  string `json:"account"`
	Password string `json:"password"`
	Email    string `json:"email"`

	Auth int `json:"auth"` // 0: 超级管理员 1: 普通管理员 2: 超级用户 3: 普通用户...
}
type UpdateUserResp struct{}

type DeleteUserReq struct {
	ID string `json:"id"`
}
type DeleteUserResp struct{}
