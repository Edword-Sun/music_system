package router

import (
	"fmt"
	"log"
	"music_system/router/handler"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"music_system/model"
	"music_system/service"
	"music_system/tool"
	"music_system/tool/filter"
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
		g.DELETE("/:id", h.DeleteUser)

		// 登入
		g.POST("/login", h.Login)
		// 注册
		g.POST("/register", h.Register)
	}

}

func (h *UserHandler) FindUser(c *gin.Context) {
	var user model.User

	if err := c.ShouldBindJSON(&user); err != nil && err.Error() != "EOF" {
		fmt.Println("error: ", err.Error())
		c.JSON(http.StatusOK, tool.Response{
			Message: "Bad Request",
			Body:    gin.H{"error": err.Error()},
		})

		return
	}

	//if user.ID == "" {
	//	c.JSON(http.StatusOK, tool.Response{
	//		Message: "Bad Request",
	//		Body:    gin.H{"error": "User ID is required"},
	//	})
	//	return
	//}

	err, getUser := h.userService.FindUser(&user)
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

	c.JSON(http.StatusOK, tool.Response{
		Message: "Success",
		Body:    getUser,
	})
}

func (h *UserHandler) CreateUser(c *gin.Context) {
	var user model.User
	if err := c.ShouldBindJSON(&user); err != nil && err.Error() != "EOF" {
		fmt.Println("error: ", err.Error())
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    gin.H{"error": err.Error()},
		})

		return
	}
	err, id := h.userService.CreateUser(&user)
	if err != nil {
		fmt.Println("error: ", err.Error())
		c.JSON(http.StatusOK, tool.Response{
			Message: "创建错误",
			Body:    gin.H{"error": err.Error()},
		})

		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "创建用户成功",
		Body:    gin.H{"id": id},
	})

}

func (h *UserHandler) UpdateUser(c *gin.Context) {
	var user model.User
	if err := c.ShouldBindJSON(&user); err != nil && err.Error() != "EOF" {
		fmt.Println("error: ", err.Error())
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    gin.H{"error": err.Error()},
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

	c.JSON(http.StatusOK, tool.Response{
		Message: "更新用户成功",
		Body:    "",
	})
}

func (h *UserHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")

	if err := h.userService.DeleteUser(&model.User{ID: id}); err != nil {
		fmt.Println("error: ", err.Error())
		c.JSON(http.StatusOK, tool.Response{
			Message: "删除错误",
			Body:    gin.H{"error": err.Error()},
		})

		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "删除用户成功",
		Body:    "",
	})
}

func (h *UserHandler) ListUser(c *gin.Context) {
	var condition filter.ListUser

	if err := c.ShouldBindJSON(&condition); err != nil {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})
		return
	}

	// todo 整合判断条件
	if condition.Size == 0 || condition.Page == 0 {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})
		return
	}
	if condition.StartTime > condition.EndTime ||
		(condition.StartTime == condition.EndTime &&
			(condition.StartTime != 0 && condition.EndTime != 0)) {
		log.Println("参数错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "参数错误",
			Body:    nil,
		})
		return
	}

	offset := (condition.Page - 1) * condition.Size
	if condition.StartTime == 0 && condition.EndTime == 0 {
		// 全局时间
		condition.EndTime = int(time.Now().UnixMilli())
	}

	// todo 时间的查询

	data, total, err := h.userService.ListUsers(offset, condition.Size)
	if err != nil {
		log.Println("list user 错误")
		c.JSON(http.StatusOK, tool.Response{
			Message: "list user 错误",
			Body:    gin.H{"error": err.Error()},
		})
		return
	}

	c.JSON(http.StatusOK, tool.Response{
		Message: "list user 成功",
		Body: gin.H{
			"total": total,
			"data":  data,
		},
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
	checkUser := model.User{
		Account: req.Account,
	}
	_, resUser := h.userService.FindUser(&checkUser)
	if len(resUser.ID) == 0 {
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
		Body:    nil,
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

	checkUser := model.User{
		Account: req.Account,
	}
	_, resUser := h.userService.FindUser(&checkUser)
	if len(resUser.ID) > 0 {
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
