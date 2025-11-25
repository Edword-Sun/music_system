package repo

import (
	"music_system/model"
	"music_system/tool/filter"
)

type IMusicHistoryRepository interface {
	CreateMusicHistory(musicHistory *model.MusicHistory) error
	FindMusicHistory(findMusicHistory filter.FindMusicHistory) (error, []*model.MusicHistory)
	ListMusicHistory(condition filter.ListMusicHistory) (error, []*model.MusicHistory, int64)
	UpdateMusicHistory(musicHistory *model.MusicHistory) error
	DeleteMusicHistory(deleteMusicHistory filter.DeleteMusicHistory) error
}
