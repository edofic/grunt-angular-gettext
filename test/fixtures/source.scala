import magic.Messages //dummy import

object Main extends App {
    Messages("msg with some quotes \"")
    "ignored" //ignored
    Messages(???) //ignored
}