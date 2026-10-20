import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { useUpdateWaterIntakeMutation } from "../slices/usersApiSlice";
import { Box } from "@mui/material";

const WaterIntakeLog = () => {
  const [currentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [totalWater, setTotalWater] = useState(0);
  const [loggedWater, setLoggedWater] = useState(0);

  const [updateWaterIntake, {isLoading: saving}] = useUpdateWaterIntakeMutation();

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;
    const timer = setTimeout(() => controller.abort(), 10000);
    const fetchWaterIntake = async () => {
      try {
        const response = await fetch(`/api/users/water-intake/${currentDate}`,{signal:controller.signal});
        if (!response.ok) throw new Error('Water log unavailable');
        const data = await response.json();
        if (mounted) setTotalWater(Number(data.litersDrank) || 0);
      } catch (error) {
        if (mounted) toast.error('Could not load today’s water log. Please try again.');
      } finally {clearTimeout(timer);}
    };
    // Always load the signed-in user's current day; no cross-user/date cache.
    fetchWaterIntake();
    return () => {mounted=false;clearTimeout(timer);controller.abort();};
  }, [currentDate]);

  const handleChange = (event) => {
    const { value } = event.target;
    setLoggedWater(value === '' ? '' : Number(value));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!Number.isFinite(loggedWater) || loggedWater <= 0) {toast.error('Enter a positive amount of water.');return;}
    try {
      const waterIntakeData = {
        litersDrank: totalWater + loggedWater,
      };

      const updatedWaterIntake = await updateWaterIntake(
        waterIntakeData
      ).unwrap();

      if (updatedWaterIntake) {
        toast.success("Water intake updated successfully!");
        setTotalWater(updatedWaterIntake.litersDrank);
        setLoggedWater(0);
      }
    } catch (error) {
      toast.error("Failed to save the water intake.");
      console.error("Save water intake error:", error);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <div className="water-intake-log">
          <h2 className="water-intake-log__total">
            Water logged today: {totalWater} litres
          </h2>
          <Form onSubmit={handleSubmit} className="water-intake-log__form">
            <Form.Label
              className="water-intake-log__label"
              htmlFor="totalWater"
            >
              Log water consumed (in litres):
              <Form.Control
                id="totalWater"
                type="number"
                min="0"
                step="0.05"
                value={loggedWater}
                onChange={handleChange}
                className="water-intake-log__input"
              />
            </Form.Label>
            <Button type="submit" disabled={saving} className="water-intake-log__button mx-2">
              Add
            </Button>
          </Form>
        </div>
      </Box>
    </>
  );
};

export default WaterIntakeLog;
