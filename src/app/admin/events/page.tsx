import { FiCalendar, FiPlus, FiFilter, FiClock, FiMapPin } from 'react-icons/fi';

export default function EventsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Events</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage upcoming church events and activities.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            Add Event
          </button>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="relative rounded-md shadow-sm w-64">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <FiFilter className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="timeframe"
                      name="timeframe"
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      defaultValue="upcoming"
                    >
                      <option value="upcoming">Upcoming Events</option>
                      <option value="past">Past Events</option>
                      <option value="all">All Events</option>
                    </select>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <FiCalendar className="-ml-0.5 mr-2 h-4 w-4" />
                      Calendar View
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-white px-4 py-5 sm:px-6">
                <div className="text-center">
                  <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming events</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by adding your first event.
                  </p>
                  <div className="mt-6">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                      New Event
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
