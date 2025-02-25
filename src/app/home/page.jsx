"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Calendar,
  User2,
  MapPin,
  Zap,
  Shield,
  Car,
  Search,
  Wind,
  Wifi,
  DollarSign,
  Users,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function Home() {
  const [searchForm, setSearchForm] = useState({
    from: "",
    to: "",
    date: "Today",
    passengers: 1,
  });
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isPassengersOpen, setIsPassengersOpen] = useState(false);
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter state
  const [maxPrice, setMaxPrice] = useState("");
  const [minSeats, setMinSeats] = useState("");
  const [filterAirCond, setFilterAirCond] = useState(false);
  const [filterWifi, setFilterWifi] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const ridesRef = collection(db, "rides");
      const q = query(
        ridesRef,
        where("pickupLocation", "==", searchForm.from),
        where("destinationLocation", "==", searchForm.to),
      );

      const querySnapshot = await getDocs(q);
      const fetchedRides = [];
      querySnapshot.forEach((doc) => {
        fetchedRides.push({ id: doc.id, ...doc.data() });
      });

      setRides(fetchedRides);
      setFilteredRides(fetchedRides);
    } catch (err) {
      console.error("Error fetching rides:", err);
      setError("Failed to fetch rides. Please try again.");
    }
    setLoading(false);
  };

  const handleFilter = () => {
    let tempRides = [...rides];

    if (maxPrice) {
      tempRides = tempRides.filter(
        (ride) => Number(ride.pricePerSeat) <= Number(maxPrice),
      );
    }
    if (minSeats) {
      tempRides = tempRides.filter(
        (ride) => Number(ride.availableSeats) >= Number(minSeats),
      );
    }
    if (filterAirCond) {
      tempRides = tempRides.filter((ride) => ride.airConditioning === true);
    }
    if (filterWifi) {
      tempRides = tempRides.filter((ride) => ride.wifiAvailable === true);
    }
    setFilteredRides(tempRides);
    if (window.innerWidth < 768) {
      setIsFilterOpen(false);
    }
  };

  const resetFilters = () => {
    setMaxPrice("");
    setMinSeats("");
    setFilterAirCond(false);
    setFilterWifi(false);
    setFilteredRides(rides);
  };

  const handlePassengerChange = (num) => {
    setSearchForm({ ...searchForm, passengers: num });
    setIsPassengersOpen(false);
  };

  const formatDateTime = (dateTimeStr) => {
    return new Date(dateTimeStr).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#8163e9] to-[#6f54c9] text-white pb-48 md:pb-64">
        <div className="container mx-auto px-4 py-12 md:py-24">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-12">
            Your pick of rides at low prices
          </h1>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="mb-6">
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* From Input */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Leaving from..."
                      value={searchForm.from}
                      onChange={(e) =>
                        setSearchForm({ ...searchForm, from: e.target.value })
                      }
                      className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8163e9] focus:border-transparent text-gray-900"
                    />
                  </div>

                  {/* To Input */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Going to..."
                      value={searchForm.to}
                      onChange={(e) =>
                        setSearchForm({ ...searchForm, to: e.target.value })
                      }
                      className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8163e9] focus:border-transparent text-gray-900"
                    />
                  </div>

                  {/* Date Selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDateOpen(!isDateOpen)}
                      className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-gray-900 hover:border-[#8163e9] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <span>{searchForm.date}</span>
                      </div>
                    </button>
                    {isDateOpen && (
                      <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-md shadow-lg border p-2 z-10">
                        {["Today", "Tomorrow", "In 2 days", "In 3 days"].map(
                          (date) => (
                            <button
                              key={date}
                              type="button"
                              onClick={() => {
                                setSearchForm({ ...searchForm, date });
                                setIsDateOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md text-gray-900"
                            >
                              {date}
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </div>

                  {/* Passengers Selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsPassengersOpen(!isPassengersOpen)}
                      className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-gray-900 hover:border-[#8163e9] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <User2 className="h-5 w-5 text-gray-400" />
                        <span>
                          {searchForm.passengers} passenger
                          {searchForm.passengers !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </button>
                    {isPassengersOpen && (
                      <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-md shadow-lg border p-2 z-10">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handlePassengerChange(num)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md text-gray-900"
                          >
                            {num} passenger{num !== 1 ? "s" : ""}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Search Button */}
                <div className="mt-4 md:mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto px-8 py-3 bg-[#8163e9] text-white rounded-md hover:bg-[#8163e9]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5" />
                        Search
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Search Results */}
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  {error}
                </div>
              </div>
            ) : rides.length > 0 ? (
              <div className="relative">
                {/* Mobile Filter Toggle */}
                <div className="md:hidden mb-4">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="w-full bg-white text-[#8163e9] border border-[#8163e9] rounded-lg px-4 py-2 flex items-center justify-center gap-2"
                  >
                    <Search className="h-5 w-5" />
                    {isFilterOpen ? "Hide Filters" : "Show Filters"}
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Filters Sidebar */}
                  <div
                    className={`
                    md:w-1/4 bg-white rounded-lg shadow-lg
                    ${isFilterOpen ? "block" : "hidden"} md:block
                    fixed md:relative top-0 left-0 right-0 z-50 md:z-auto
                    h-screen md:h-auto overflow-auto md:overflow-visible
                    p-4 md:p-6
                  `}
                  >
                    {/* Mobile Close Button */}
                    <div className="flex items-center justify-between mb-4 md:hidden">
                      <h2 className="text-lg font-semibold text-black">
                        Filters
                      </h2>
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Price Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Price per Seat
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8163e9] focus:border-transparent"
                            placeholder="No limit"
                          />
                        </div>
                      </div>

                      {/* Seats Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Available Seats
                        </label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="number"
                            value={minSeats}
                            onChange={(e) => setMinSeats(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8163e9] focus:border-transparent"
                            placeholder="Any number"
                          />
                        </div>
                      </div>

                      {/* Amenities */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amenities
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filterAirCond}
                              onChange={(e) =>
                                setFilterAirCond(e.target.checked)
                              }
                              className="w-4 h-4 text-[#8163e9] border-gray-300 rounded focus:ring-[#8163e9]"
                            />
                            <Wind className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              Air Conditioning
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filterWifi}
                              onChange={(e) => setFilterWifi(e.target.checked)}
                              className="w-4 h-4 text-[#8163e9] border-gray-300 rounded focus:ring-[#8163e9]"
                            />
                            <Wifi className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              WiFi Available
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Filter Actions */}
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={handleFilter}
                          className="w-full py-2 px-4 bg-[#8163e9] text-white rounded-md hover:bg-[#8163e9]/90 transition-colors"
                        >
                          Apply Filters
                        </button>
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Reset Filters
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ride List */}
                  <div className="md:w-3/4">
                    <div className="bg-white rounded-lg shadow-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-black">
                          Available Rides
                        </h2>
                        <span className="text-sm text-gray-500">
                          {filteredRides.length}{" "}
                          {filteredRides.length === 1 ? "ride" : "rides"} found
                        </span>
                      </div>

                      {filteredRides.length > 0 ? (
                        <div className="space-y-4">
                          {filteredRides.map((ride) => (
                            <Link
                              key={ride.id}
                              href={`/home/rides/${ride.id}`}
                              className="block"
                            >
                              <div className="border rounded-lg p-4 hover:border-[#8163e9] transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-[#8163e9]" />
                                      <span className="font-medium text-black">
                                        {ride.pickupLocation}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-[#8163e9]" />
                                      <span className="font-medium text-black">
                                        {ride.destinationLocation}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-black">
                                      ${ride.pricePerSeat}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      per seat
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4 text-gray-400" />
                                      <span className="text-gray-600">
                                        {formatDateTime(ride.startDateTime)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Users className="h-4 w-4 text-gray-400" />
                                      <span className="text-gray-600">
                                        {ride.availableSeats} seats left
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {ride.airConditioning && (
                                      <Wind className="h-4 w-4 text-[#8163e9]" />
                                    )}
                                    {ride.wifiAvailable && (
                                      <Wifi className="h-4 w-4 text-[#8163e9]" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-black mb-2">
                            No rides found
                          </h3>
                          <p className="text-gray-500">
                            Try adjusting your filters or search for different
                            locations
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Hero Image */}
        <div className="absolute bottom-0 left-0 w-full h-48 md:h-64">
          <Image
            src="/bus.jpg"
            alt="Illustration of cars and buses"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-[#8163e9]/10">
                <Car className="h-8 w-8 text-[#8163e9]" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">
                Your pick of rides at low prices
              </h3>
              <p className="text-gray-600">
                No matter where you're going, by bus or carpool, find the
                perfect ride from our wide range of destinations and routes at
                low prices.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-[#8163e9]/10">
                <Shield className="h-8 w-8 text-[#8163e9]" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">
                Trust who you travel with
              </h3>
              <p className="text-gray-600">
                We take the time to get to know each of our members and bus
                partners. We check reviews, profiles and IDs, so you know who
                you're travelling with and can book your ride at ease on our
                secure platform.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-[#8163e9]/10">
                <Zap className="h-8 w-8 text-[#8163e9]" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">
                Scroll, click, tap and go!
              </h3>
              <p className="text-gray-600">
                Booking a ride has never been easier! Thanks to our simple app
                powered by great technology, you can book a ride close to you in
                just minutes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
