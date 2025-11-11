package check

import (
	"music_system/model"
	"music_system/router/handler"
	"music_system/tool/filter"
)

func CheckFindUser(req *handler.FindUserReq) (error, filter.FindUser) {
	return nil, filter.FindUser{}
}

func CheckListUser(req *handler.ListUserReq) (error, filter.ListUser) {
	return nil, filter.ListUser{}
}

func CheckLogin(req *handler.LoginReq) (error, handler.LoginReq) {
	return nil, handler.LoginReq{}
}

func CheckRegister(req *handler.RegisterReq) (error, handler.RegisterReq) {
	return nil, handler.RegisterReq{}
}

func CheckCreateUser(req *handler.CreateUserReq) (error, model.User) {
	return nil, model.User{}
}

func CheckUpdateUser(req *handler.UpdateUserReq) (error, model.User) {
	return nil, model.User{}
}

func CheckDeleteUser(req *handler.DeleteUserReq) (error, handler.DeleteUserReq) {
	return nil, handler.DeleteUserReq{}
}
