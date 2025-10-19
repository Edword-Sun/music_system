package main

import (
	"github.com/gin-gonic/gin"

	"music_system/config"
	"music_system/repository"
	"music_system/router"
	"music_system/service"
)

func main() {
	// Initialize database connection
	config.InitDB()

	r := gin.Default()

	// Initialize repository
	userRepo := repository.NewUserRepository(config.DB)
	musicRepo := repository.NewMusicRepository(config.DB)
	commentRepo := repository.NewCommentRepository(config.DB)

	// Initialize services
	userService := service.NewUserService(userRepo)
	musicService := service.NewMusicService(musicRepo)
	commentService := service.NewCommentService(commentRepo)

	// Initialize handlers and register routes
	healthHandler := router.NewHealthHandler()

	userHandler := router.NewUserHandler(userService)
	musicHandler := router.NewMusicHandler(musicService)
	commentHandler := router.NewCommentHandler(commentService)

	healthHandler.Init(r)
	userHandler.Init(r)
	musicHandler.Init(r)
	commentHandler.Init(r)

	r.Run(":8080") // listen and serve on 0.0.0.0:8080
}
