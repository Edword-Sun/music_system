package model

import (
	"time"

	"gorm.io/gorm"
)

type MusicHistory struct {
	ID      string `gorm:"primarykey type:text;default:(UUID())" json:"id"`
	MusicID string `gorm:"type:text" json:"music_id"`
	UserID  string `gorm:"type:text" json:"user_id"`

	// 音乐条目的基本信息
	Title       string `gorm:"type:text" json:"title"`       // 标题
	Description string `gorm:"type:text" json:"description"` // 详情

	CreateTime time.Time `gorm:"type:DATETIME with time zone;not null" json:"create_time"`
	UpdateTime time.Time `gorm:"type:DATETIME with time zone;not null" json:"update_time"`
}

func (m *MusicHistory) TableName() string {
	return "music_history"
}

func (m *MusicHistory) BeforeCreate(*gorm.DB) (err error) {
	m.CreateTime = time.Now()
	m.UpdateTime = time.Now()
	return nil
}

func (m *MusicHistory) BeforeUpdate(*gorm.DB) (err error) {
	m.UpdateTime = time.Now()
	return nil
}
