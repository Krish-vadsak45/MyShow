import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { SeatLayoutSkeleton } from "../components/skeletons";
import { ClockIcon, ArrowRightIcon } from "lucide-react";
import IsoTimeFormat from "../lib/IsoTimeFormat";
import BlurCircle from "../components/BlurCircle";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

const Seat = memo(({ seatId, isSelected, isOccupied, onClick }) => {
  return (
    <button
      onClick={() => onClick(seatId)}
      className={` h-8 w-8 rounded border border-primary/60 cursor-pointer 
      ${isSelected && "bg-primary text-white"}
      ${isOccupied && "opacity-50"} `}
    >
      {seatId}
    </button>
  );
});

Seat.propTypes = {
  seatId: PropTypes.string.isRequired,
  isSelected: PropTypes.bool,
  isOccupied: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

const SeatLayout = () => {
  const { id, date } = useParams();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [seatTokens, setSeatTokens] = useState({});

  const { axios, user } = useAppContext();

  const groupRows = useMemo(
    () => [
      ["A", "B"],
      ["C", "D"],
      ["E", "F"],
      ["G", "H"],
      ["I", "J"],
    ],
    [],
  );

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      if (data.success) {
        setShow(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSeatClick = useCallback(
    async (seatId) => {
      // If seat is already selected, unlock it
      if (selectedSeats.includes(seatId)) {
        const token = seatTokens[seatId]; // Access the stored token
        await axios.post("/api/booking/unlock", {
          showId: id,
          seatId,
          lockToken: token,
        });
        setSelectedSeats((prev) => prev.filter((s) => s !== seatId));
      } else {
        // Lock the seat and save the token
        const { data } = await axios.post("/api/booking/lock", {
          showId: id,
          seatId,
        });
        if (data.success) {
          // SAVE THE TOKEN!
          setSeatTokens((prev) => ({ ...prev, [seatId]: data.lockToken }));
          setSelectedSeats((prev) => [...prev, seatId]);
        }
      }
    },
    [selectedSeats, seatTokens, axios, id],
  );

  const renderSeats = useCallback(
    (row, count = 9) => (
      <div key={row} className="flex gap-2 mt-2">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {Array.from({ length: count }, (_, i) => {
            const seatId = `${row}${i + 1}`;
            return (
              <Seat
                key={seatId}
                seatId={seatId}
                isSelected={selectedSeats.includes(seatId)}
                isOccupied={occupiedSeats.includes(seatId)}
                onClick={handleSeatClick}
              />
            );
          })}
        </div>
      </div>
    ),
    [selectedSeats, occupiedSeats, handleSeatClick],
  );

  const getOccupiedSeats = async () => {
    try {
      const { data } = await axios.get(
        `/api/booking/seats/${selectedTime.showId}`,
      );

      if (data.success) {
        setOccupiedSeats(data.occupiedSeats);
      } else {
        toast.error(data.messge);
      }
    } catch (error) {
      console.error("Failed to fetch occupied seats:", error);
    }
  };

  const bookTickets = async () => {
    try {
      if (!user) {
        return toast.error("Please login to proceed");
      }
      if (!selectedTime || !selectedSeats.length) {
        return toast.error("Please select a time and seats");
      }
      const { data } = await axios.post("/api/booking/create", {
        showId: selectedTime.showId,
        selectedSeats,
      });
      if (data.success) {
        globalThis.location.href = data.url;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getShow();
  }, [id]);

  useEffect(() => {
    if (selectedTime) {
      getOccupiedSeats();
    }
  }, [selectedTime]);

  if (!show) {
    return <SeatLayoutSkeleton />;
  }

  return (
    <div
      className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30
        md: pt-50"
    >
      {/* Available Timings */}
      <div
        className="w-60 bg-primary/10 border border-primary/20 rounded-1g py-10
        h-max md:sticky md: top-30"
      >
        <p className="text-lg font-semibold px-6">Available Timings</p>
        <div className="mt-5 space-y-1">
          {show.dateTime[date].map((item) => (
            <button
              key={item.time}
              onClick={() => setSelectedTime(item)}
              className={`flex items-center gap-2 px-6 py-2 w-full text-left rounded-r-md transition ${
                selectedTime?.time === item.time
                  ? "bg-primary text-white"
                  : "hover:bg-primary/20"
              }`}
            >
              <ClockIcon className="w-4 h-4" />
              <p className="text-sm">{IsoTimeFormat(item.time)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Seat Layout */}
      <div className="relative flex-1 flex flex-col items-center max-md:mt-16">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0" right="0" />
        <h1 className="text-2x1 font-semibold mb-4">Select your seat</h1>
        <img src={assets.screenImage} alt="screen" loading="lazy" />
        <p className="text-gray-400 text-sm mb-6">SCREEN SIDE</p>
        <div className="flex flex-col items-center mt-10 text-xs text-gray-300">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">
            {groupRows[0].map((row) => renderSeats(row))}
          </div>

          <div className="grid grid-cols-2 gap-11">
            {groupRows.slice(1).map((group) => {
              const groupKey = group.join("-");
              return (
                <div key={groupKey}>{group.map((row) => renderSeats(row))}</div>
              );
            })}
          </div>
        </div>
        <button
          onClick={() => {
            bookTickets();
          }}
          className="flex items-center gap-1 px-10 py-3 mt-20 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active: scale-95"
        >
          Proceed to Checkout
          <ArrowRightIcon strokeWidth={3} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SeatLayout;
