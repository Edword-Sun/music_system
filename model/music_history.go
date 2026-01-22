package model

import (
	"time"

	"gorm.io/gorm"
)

type MusicHistory struct {
	ID      string `gorm:"primarykey type:text;default:(UUID())" json:"id"`
	MusicID string `gorm:"type:text" json:"music_id"`

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
