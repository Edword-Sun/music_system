package check

import (
	"errors"
	"log"
	"time"

	uuid "github.com/satori/go.uuid"

	"music_system/model"
	"music_system/router/handler"
	"music_system/tool/base_number/user"
	"music_system/tool/filter"
)

func CheckFindUser(req *handler.FindUserReq) (error, filter.FindUser) {
	var res filter.FindUser

	// 校验

	// 赋值
	res = filter.FindUser{
		ID:       req.ID,
		Name:     req.Name,
		Account:  req.Account,
		Password: req.Password,
		Email:    req.Email,
		Auth:     req.Auth,
	}

	return nil, res
}

func CheckListUser(req *handler.ListUserReq) (error, filter.ListUser) {
	var res filter.ListUser

	if req.Page == 0 {
		return errors.New("page不能为0"), filter.ListUser{}
	}
	if req.Size == 0 {
		return errors.New("size不能为0"), filter.ListUser{}
	}
	if req.Page > user.MaxPage {
		return errors.New("page不能超过1000"), filter.ListUser{}
	}
	if req.Size > user.MaxSize {
		return errors.New("size不能超过1000"), filter.ListUser{}
	}

	if req.StartTime > req.EndTime {
		log.Println("CheckListUser: 起始时间大于结束时间 错误")
		return errors.New("起始时间大于结束时间"), res
	}
	if req.StartTime == 0 && req.EndTime == 0 {
		req.EndTime = time.Now().UnixMilli()
	}

	res = filter.ListUser{
		IDs:       req.IDs,
		Names:     req.Names,
		Accounts:  req.Accounts,
		Passwords: req.Passwords,
		Emails:    req.Emails,
		Offset:    (req.Page - 1) * req.Size,
		Limit:     req.Size,
		StartTime: req.StartTime,
		EndTime:   req.EndTime,
	}

	return nil, res
}

func CheckLogin(req *handler.LoginReq) (error, filter.FindUser) {
	var res filter.FindUser

	if len(req.Account) == 0 {
		log.Println("account不能为0")
		return errors.New("account不能为0"), filter.FindUser{}
	}

	res = filter.FindUser{
		Account: req.Account,
	}

	return nil, res
}

func CheckRegister(req *handler.RegisterReq) (error, filter.FindUser) {
	var res filter.FindUser

	if len(req.Account) == 0 {
		log.Println("account不能为空")
		return errors.New("account不能为空"), res
	}

	res = filter.FindUser{
		Account: req.Account,
	}

	return nil, res
}

func CheckCreateUser(req *handler.CreateUserReq) (error, model.User) {
	var res model.User

	if len(req.Account) == 0 {
		log.Println("account不能为空")
		return errors.New("account不能为空"), model.User{}
	}
	if len(req.Password) == 0 {
		return errors.New("password不能为空"), model.User{}
	}
	if len(req.Email) == 0 {
		return errors.New("email不能为空"), model.User{}
	}

	res = model.User{
		ID:         uuid.NewV4().String(),
		Name:       req.Name,
		Account:    req.Account,
		Password:   req.Password,
		Email:      req.Email,
		Auth:       3,
		CreateTime: time.Now(),
		UpdateTime: time.Now(),
	}

	return nil, res
}

func CheckUpdateUser(req *handler.UpdateUserReq) (error, model.User) {
	var res model.User

	if len(req.ID) == 0 {
		log.Println("id不能为空，因为要定位用户")
		return errors.New("id不能为空，因为要定位用户"), model.User{}
	}

	res = model.User{
		ID:   req.ID,
		Name: req.Name,
		//Account:    "",
		//Password:   "",
		//Email:      "",
		Auth: req.Auth,
	}
	if len(req.Name) > 0 {
		res.Name = req.Name
	}
	if len(req.Account) > 0 {
		res.Account = req.Account
	}
	if len(req.Password) > 0 {
		res.Password = req.Password
	}
	if len(req.Email) > 0 {
		res.Email = req.Email
	}

	return nil, res
}

func CheckDeleteUser(req *handler.DeleteUserReq) (error, model.User) {
	var res model.User

	if !(len(req.ID) > 0) {
		log.Println("id不能为0")
		return errors.New("id不能为0"), model.User{}
	}

	res = model.User{
		ID: req.ID,
	}

	return nil, res
}
