import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useRef, useState } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ClickAwayListener } from "@mui/material";
import Box from "@mui/material/Box";
import { setCustomFilters } from "../../slices/filterSlice";
import { useDispatch } from "react-redux";
// import { toast } from "react-toastify";
// import { FaXmark } from "react-icons/fa6";

const FiltersModal = ({ overlayOpen, closeOverlay }) => {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);
  const [filters, setFilters] = useState({
    from_date: null,
    to_date: null,
    business_unit: [],
  })

  const dispatch = useDispatch();

  const handleStartClick = () => {
    setStartOpen(false);
  };

  const handleEndClick = () => {
    setEndOpen(false);
  };

  const handleBUFilter = (e) => {
    if(e.target.checked){
      setFilters((prev) => ({
        ...prev,
        business_unit: [...prev.business_unit, e.target.id],
      }));
    }else {
      setFilters((prev) => ({
        ...prev,
        business_unit: prev.business_unit.filter((bu) => bu !== e.target.id),
      }));
    }
  }
  const submitHandler = (e) => {
    e.preventDefault();
    console.log(filters);
    // let from = `${filters.from_date?.$M+1 }/${filters.from_date?.$D}/${filters.from_date?.$y}`;
    // let to = `${filters.to_date?.$M+1 }/${filters.to_date?.$D}/${filters.to_date?.$y}`;
    const res = { from_date: filters.from_date?.$d.toISOString(), to_date: filters.to_date?.$d.toISOString(), business_unit: filters.business_unit }
    dispatch(setCustomFilters({ ...res}));
    closeOverlay();
  };
  return (
    <>
      <Transition appear show={true} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => closeOverlay()}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="overflow-auto w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-medium leading-6 text-gray-900 border-b border-gray-900 pb-2"
                  >
                    Add Custom Filters
                  </Dialog.Title>
                  <form
                    className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6"
                    onSubmit={submitHandler}
                  >
                    <div className="sm:col-span-3">
                      <ClickAwayListener
                        onClickAway={handleStartClick}
                        mouseEvent="onMouseDown"
                      >
                        <Box style={{ position: "relative" }}>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              open={startOpen}
                              onOpen={() => setStartOpen(true)}
                              PopperProps={{
                                disablePortal: true,
                              }}
                              label="Start Date"
                              className="w-full MyDatePicker"
                              maxDate={maxDate}
                              onChange={(e) => {
                                setFilters((prev) => ({...prev, from_date: e}))
                                setMinDate(e);
                              }}
                            />
                          </LocalizationProvider>
                        </Box>
                      </ClickAwayListener>
                    </div>

                    <div className="sm:col-span-3">
                      <ClickAwayListener
                        onClickAway={handleEndClick}
                        mouseEvent="onMouseDown"
                      >
                        <Box style={{ position: "relative" }}>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              open={endOpen}
                              onOpen={() => setEndOpen(true)}
                              PopperProps={{
                                disablePortal: true,
                              }}
                              label="End Date"
                              className="w-full MyDatePicker"
                              closeOnSelect
                              minDate={minDate}
                              onChange={(e) => {
                                setFilters((prev) => ({...prev, to_date: e.$d.toISOString()}))
                                setMaxDate(e);
                              }}
                            />
                          </LocalizationProvider>
                        </Box>
                      </ClickAwayListener>
                    </div>

                    <div className="col-span-full">
                      <p className="font-semibold">Business Units</p>
                      <div className="mt-2">
                        <input
                          type="checkbox"
                          className="mr-2 w-4 h-4"
                          id="HBI"
                          onChange={handleBUFilter}
                        />
                        <label for="HBI">Healthcare Business Intelligence (BI)</label>
                      </div>

                      <div className="mt-2">
                        <input
                          type="checkbox"
                          className="mr-2 w-4 h-4"
                          id="HTI"
                          onChange={handleBUFilter}
                        />
                        <label for="HTI">Healthcare Technical Intelligence (TI)</label>
                      </div>

                      <div className="mt-2">
                        <input
                          type="checkbox"
                          className="mr-2 w-4 h-4"
                          id="HIP"
                          onChange={handleBUFilter}
                        />
                        <label for="HIP">Healthcare Intellectual Property (IP)</label>
                      </div>

                      <div className="mt-2">
                        <input
                          type="checkbox"
                          className="mr-2 w-4 h-4"
                          id="HIPI"
                          onChange={handleBUFilter}
                        />
                        <label for="HIPI">Hitech Intellectual Property (IP)</label>
                      </div>

                      <div className="mt-2">
                        <input
                          type="checkbox"
                          className="mr-2 w-4 h-4"
                          id="CFH"
                          onChange={handleBUFilter}
                        />
                        <label for="CFH">Chemical Food and Hitech (CFH)</label>
                      </div>
                    </div>

                    <div className="mt-4 col-span-full">
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      >
                        Apply
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default FiltersModal;
