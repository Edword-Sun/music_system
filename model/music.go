package model

import (
	"gorm.io/gorm"
	"time"
)

type Music struct {
	ID          string `gorm:"primarykey type:text;default:(UUID())" json:"id"`
	Description string `gorm:"type:text" json:"description"`
	SingerName  string `gorm:"type:text" json:"singer_name"`
	Name        string `gorm:"type:text" json:"name"`
	Album       string `gorm:"type:text" json:"album"`
	Band        string `gorm:"type:text" json:"band"`
	DurationMs  int    `gorm:"type:integer" json:"duration_ms"`
	MimeType    string `gorm:"type:text" json:"mime_type"`
	BitrateKbps int    `gorm:"type:integer" json:"bitrate_kbps"`
	FileSize    int64  `gorm:"type:bigint" json:"file_size"`
	HashSHA256  string `gorm:"type:text" json:"hash_sha256"`
	Status      string `gorm:"type:text" json:"status"`
	IsDelete    bool   `gorm:"type:boolean" json:"is_delete"`
	VisitCount  int    `gorm:"type:integer;default:0" json:"visit_count"`
	StreamerID  string `gorm:"type:text" json:"streamer_id"`

	CreateTime time.Time `gorm:"type:DATETIME with time zone;not null" json:"create_time"`
	UpdateTime time.Time `gorm:"type:DATETIME with time zone;not null" json:"update_time"`
}

func (m *Music) TableName() string {
	return "music"
}

func (m *Music) BeforeCreate(tx *gorm.DB) (err error) {
	m.CreateTime = time.Now()
	m.UpdateTime = time.Now()
	return nil
}

func (m *Music) BeforeUpdate(tx *gorm.DB) (err error) {
	m.UpdateTime = time.Now()
	return nil
}
