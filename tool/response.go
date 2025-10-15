package tool

type Response struct {
	Message string      `json:"message"`
	Body    interface{} `json:"body"`
}
