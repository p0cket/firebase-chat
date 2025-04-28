import { Link, useParams } from "react-router-dom"

function Calendar() {
  const { id } = useParams()
  return (
    <div>
      Calendar {id}
      <div>
        <Link to={`/calendar`}>
          <h2>Cal Link</h2>
        </Link>
        <Link to={`/another`}>
          <h2>Link 2</h2>
        </Link>
        <Link to={`/calendar/${2 + 4}`}>
          <h2>Variable Link</h2>
        </Link>
      </div>
    </div>
  )
}

export default Calendar
