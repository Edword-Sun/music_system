package main

import (
	"music_system/tool/music_storage_path"
	"os"

	"github.com/gin-gonic/gin"

	"music_system/config"
	"music_system/repository"
	"music_system/router"
	"music_system/service"
)

func main() {
	// 确保目录存在（可选）
	if err := os.MkdirAll(music_storage_path.MusicRoot, 0755); err != nil {
		panic("Failed to create music directory: " + err.Error())
	}

	// Initialize database connection
	config.InitDB()

	r := gin.Default()

	// Initialize repository
	userRepo := repository.NewUserRepository(config.DB)
	musicRepo := repository.NewMusicRepository(config.DB)
	commentRepo := repository.NewCommentRepository(config.DB)
	userActionPropertiesRepo := repository.NewUserActionProperties(config.DB)
	musicHistoryRepository := repository.NewMusicHistoryRepository(config.DB)

	// Initialize services
	userService := service.NewUserService(userRepo)
	musicService := service.NewMusicService(musicRepo)
	commentService := service.NewCommentService(commentRepo)
	userActionPropertiesService := service.NewUserActionPropertiesService(userActionPropertiesRepo)
	musicHistoryService := service.NewMusicHistoryService(musicHistoryRepository)

	// Initialize handlers and register routes
	healthHandler := router.NewHealthHandler()

	userHandler := router.NewUserHandler(userService)
	musicHandler := router.NewMusicHandler(musicService)
	commentHandler := router.NewCommentHandler(commentService)
	userActionPropertiesHandler := router.NewUserActionPropertiesHandler(userActionPropertiesService)
	musicHistoryHandler := router.NewMusicHistoryHandler(musicHistoryService)

	healthHandler.Init(r)
	userHandler.Init(r)
	musicHandler.Init(r)
	commentHandler.Init(r)
	userActionPropertiesHandler.Init(r)
	musicHistoryHandler.Init(r)

	r.Run(":8080") // listen and serve on 0.0.0.0:8080
}
