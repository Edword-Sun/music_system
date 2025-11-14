package router

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"music_system/model"
	"music_system/router/check"
	"music_system/router/handler"
	"music_system/service"
	"music_system/tool"
)

type UserHandler struct {
	userService *service.UserService
}

func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

func (h *UserHandler) Init(engine *gin.Engine) {
	g := engine.Group("/user")
	{
		g.POST("/find", h.FindUser)
		g.POST("/list/", h.ListUser)

		g.POST("", h.CreateUser)
		g.PUT("", h.UpdateUser)
		g.DELETE("/", h.DeleteUser)

		// 登入
		g.POST("/login", h.Login)
		// 注册
		g.POST("/register", h.Register)
	}

}

func (h *UserHandler) FindUser(c *gin.Context) {
	var req handler.FindUserReq
	var resp handler.FindUserResp

	if err := c.ShouldBindJSON(&req); err != nil && err.Error() != "EOF" {
		fmt.Println("error: ", err.Error())
		c.JSON(http.StatusOK, tool.Response{
			Message: "Bad Request",
			Body:    gin.H{"error": err.Error()},
		})

		return
	}

	err, condition := check.CheckFindUser(&req)
	if err != nil {
		fmt.Println("error: ", err.Error())
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    gin.H{"error": err.Error()},
		})
		return
	}

	err, getUser := h.userService.FindUser(&condition)
	if err != nil {
		fmt.Println("error: ", err.Error())
		c.JSON(http.StatusOK, tool.Response{
			Message: "Internal Server Error",
			Body:    gin.H{"error": err.Error()},
		})
		return
	}

	if getUser == nil {
		c.JSON(http.StatusOK, tool.Response{
			Message: "不存在",
			Body:    "",
		})
		return
	}

	log.Println("find user完成")
	resp.Data = *getUser
	c.JSON(http.StatusOK, tool.Response{
		Message: "Success",
		Body:    getUser,
	})
}

func (h *UserHandler) ListUser(c *gin.Context) {
	var req handler.ListUserReq
	var resp handler.ListUserResp

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})
		return
	}

	err, condition := check.CheckListUser(&req)
	data, total, err := h.userService.ListUsers(condition)
	if err != nil {
		log.Println("list user 错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "list user 错误",
			Body:    gin.H{"error": err.Error()},
		})
		return
	}

	resp.Total = total
	resp.Data = data
	c.JSON(http.StatusOK, tool.Response{
		Message: "list user 成功",
		Body:    resp,
	})
}

func (h *UserHandler) CreateUser(c *gin.Context) {
	var req handler.CreateUserReq
	var resp handler.CreateUserResp

	if err := c.ShouldBindJSON(&req); err != nil && err.Error() != "EOF" {
		fmt.Println("error: ", err.Error())
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    gin.H{"error": err.Error()},
		})

		return
	}

	err, user := check.CheckCreateUser(&req)

	err, id := h.userService.CreateUser(&user)
	if err != nil {
		fmt.Println("error: ", err.Error())
		c.JSON(http.StatusOK, tool.Response{
			Message: "创建错误",
			Body:    gin.H{"error": err.Error()},
		})

		return
	}

	resp.ID = id
	c.JSON(http.StatusOK, tool.Response{
		Message: "创建用户成功",
		Body:    resp,
	})

}

func (h *UserHandler) UpdateUser(c *gin.Context) {
	var req handler.UpdateUserReq
	//var resp handler.UpdateUserResp

	var user model.User
	if err := c.ShouldBindJSON(&req); err != nil && err.Error() != "EOF" {
		fmt.Println("error: ", err.Error())
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    gin.H{"error": err.Error()},
		})

		return
	}

	err, user := check.CheckUpdateUser(&req)
	if err != nil {
		log.Println("校验参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "校验参数错误",
			Body:    err,
		})
		return
	}

	if err := h.userService.UpdateUser(&user); err != nil {
		fmt.Println("error: ", err.Error())
		c.JSON(http.StatusOK, tool.Response{
			Message: "更新错误",
			Body:    gin.H{"error": err.Error()},
		})

		return
	}

	log.Println("update user 完成")
	c.JSON(http.StatusOK, tool.Response{
		Message: "更新用户成功",
		Body:    "",
	})
}

func (h *UserHandler) DeleteUser(c *gin.Context) {
	var req handler.DeleteUserReq
	//var resp handler.DeleteUserResp
	var user model.User

	if err := c.ShouldBindJSON(&req); err != nil && err.Error() != "EOF" {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    err,
		})
		return
	}

	err, user := check.CheckDeleteUser(&req)
	if err != nil {
		log.Println("校验参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "校验参数错误",
			Body:    err,
		})
	}

	if err := h.userService.DeleteUser(&user); err != nil {
		fmt.Println("error: ", err.Error())
		c.JSON(http.StatusOK, tool.Response{
			Message: "删除错误",
			Body:    gin.H{"error": err.Error()},
		})

		return
	}

	log.Println("删除用户成功")
	c.JSON(http.StatusOK, tool.Response{
		Message: "删除用户成功",
		Body:    "",
	})
}

func (h *UserHandler) Login(c *gin.Context) {
	// 1 检查帐户
	// 2 检查密码
	// 3 通过验证

	req := handler.LoginReq{}
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})
		return
	}

	// 1 检查帐户
	err, checkUser := check.CheckLogin(&req)
	if err != nil {
		log.Println("校验参数错误 err: ", err.Error())
		c.JSON(http.StatusOK, tool.Response{
			Message: "校验参数错误",
			Body: gin.H{
				"error": err.Error(),
			},
		})
		return
	}

	_, resUser := h.userService.FindUser(&checkUser)
	if resUser == nil {
		log.Println("帐户或密码错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "帐户或密码错误",
			Body:    nil,
		})
		return
	}

	// 2 检查密码
	if resUser.Password != req.Password {
		log.Println("帐户或密码错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "帐户或密码错误",
			Body:    nil,
		})
		return
	}

	// 3 通过验证
	log.Println("登入成功")
	c.JSON(http.StatusOK, tool.Response{
		Message: "登入成功",
		Body:    gin.H{"user": resUser},
	})
}

func (h *UserHandler) Register(c *gin.Context) {
	// 1 检查帐户是否存在
	// 2 新建用户

	// 1 检查帐户是否存在
	var req handler.RegisterReq
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})
		return
	}

	err, checkUser := check.CheckRegister(&req)
	if err != nil {
		log.Println("校验参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "校验参数错误",
			Body:    nil,
		})
		return
	}

	_, resUser := h.userService.FindUser(&checkUser)
	if resUser != nil {
		log.Println("帐户存在")
		c.JSON(http.StatusOK, tool.Response{
			Message: "帐户存在",
			Body:    nil,
		})
		return
	}

	// 2 新建用户
	addUser := model.User{
		Name:     req.Account,
		Account:  req.Account,
		Password: req.Password,
		Email:    req.Email,
		Auth:     3, // 普通用户
	}
	err, id := h.userService.CreateUser(&addUser)
	if err != nil {
		log.Println("创建失败")
		c.JSON(http.StatusOK, tool.Response{
			Message: "创建失败",
			Body: gin.H{
				"err": err,
			},
		})
		return
	}

	log.Println("创建成功")
	c.JSON(http.StatusOK, tool.Response{
		Message: "创建成功",
		Body: gin.H{
			"id": id,
		},
	})
}
