package service

import (
	"crypto/sha256"
	"encoding/hex"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	uuid "github.com/satori/go.uuid"

	"music_system/model"
	"music_system/repository"
	"music_system/tool/filter"
	"music_system/tool/music_storage_path"
)

type StreamerService struct {
	repo *repository.StreamerRepository
}

func NewStreamerService(repo *repository.StreamerRepository) *StreamerService {
	return &StreamerService{repo: repo}
}

func (svc *StreamerService) CreateStreamer(streamer *model.Streamer) error {
	if streamer.ID == "" {
		streamer.ID = uuid.NewV4().String()
	}
	err := svc.repo.Create(streamer)
	if err != nil {
		return err
	}
	return nil
}

func (svc *StreamerService) ProcessUpload(header *multipart.FileHeader) (*model.Streamer, error) {
	// 打开文件以读取内容
	file, err := header.Open()
	if err != nil {
		return nil, err
	}
	defer file.Close()

	// 计算文件哈希
	hash := sha256.New()
	if _, err := io.Copy(hash, file); err != nil {
		return nil, err
	}
	hashSum := hex.EncodeToString(hash.Sum(nil))

	// 获取文件后缀
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext == "" {
		ext = ".mp3" // 默认 mp3
	}

	// 生成相对存储路径 (例如: a3/a3f8c2b1.mp3)
	relDir := hashSum[:2]
	relPath := filepath.Join(relDir, hashSum+ext)
	fullDir := filepath.Join(music_storage_path.MusicRoot, relDir)
	fullPath := filepath.Join(music_storage_path.MusicRoot, relPath)

	// 创建目录
	if err := os.MkdirAll(fullDir, 0755); err != nil {
		return nil, err
	}

	// 如果文件不存在则保存
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		out, err := os.Create(fullPath)
		if err != nil {
			return nil, err
		}
		defer out.Close()

		// 重新打开原始文件以从头读取并保存
		src, err := header.Open()
		if err != nil {
			return nil, err
		}
		defer src.Close()

		if _, err = io.Copy(out, src); err != nil {
			return nil, err
		}
	}

	// 保存记录到数据库
	streamer := &model.Streamer{
		StoragePath:  filepath.ToSlash(relPath),
		OriginalName: header.Filename,
		Format:       strings.TrimPrefix(ext, "."),
	}

	err = svc.CreateStreamer(streamer)
	if err != nil {
		return nil, err
	}

	return streamer, nil
}

func (svc *StreamerService) FindStreamer(condition *filter.FindStreamer) (*model.Streamer, error) {
	data, err := svc.repo.Find(condition)
	if err != nil {
		return nil, err
	}
	return data, nil
}

func (svc *StreamerService) UpdateStreamer(data *model.Streamer) error {
	err := svc.repo.Update(data)
	if err != nil {
		return err
	}
	return nil
}

func (svc *StreamerService) DeleteStreamer(id string) error {
	err := svc.repo.Delete(id)
	if err != nil {
		return err
	}
	return nil
}

func (svc *StreamerService) ListStreamer(page, size int, searchName string) ([]model.Streamer, int64, error) {
	offset := (page - 1) * size
	return svc.repo.List(offset, size, searchName)
}
