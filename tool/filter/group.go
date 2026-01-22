package filter

import "time"

type FindGroup struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	// 在json里找
	MusicIDs []string `json:"music_ids"`
}

type ListGroup struct {
	Name      string    `json:"name"`
	Page      int       `json:"page"`
	Size      int       `json:"size"`
	StartTime time.Time `json:"start_time"`
	EndTime   time.Time `json:"end_time"`
}
