package filter

type ListUser struct {
	Page      int `json:"page"`
	Size      int `json:"size"`
	StartTime int `json:"start_time"`
	EndTime   int `json:"end_time"`
}
