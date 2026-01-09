package repo

import (
	"music_system/model"
	"music_system/tool/filter"
)

type IStreamerRepository interface {
	Create(data *model.Streamer) error
	Find(filter *filter.FindStreamer) (*model.Streamer, error)
	Update(data *model.Streamer) error
	Delete(id string) error
	RealDelete(id string) error
}
