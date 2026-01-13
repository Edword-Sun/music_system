package service

import (
	uuid "github.com/satori/go.uuid"

	"music_system/model"
	"music_system/repository"
	"music_system/tool/filter"
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

func (svc *StreamerService) ListStreamer(page, size int) ([]model.Streamer, int64, error) {
	offset := (page - 1) * size
	return svc.repo.List(offset, size)
}
