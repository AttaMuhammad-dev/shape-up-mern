import {localDay} from '../utils/reminders';
import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import {
  useUpdateMealPlanMutation,
} from "../slices/usersApiSlice";
// Note: useCreateMealPlanMutation is removed because the Update action handles creation automatically (Upsert).

const MealPlan = () => {
  // FIX 1: Use ISO string for reliable YYYY-MM-DD format
  const [currentDate, setCurrentDate] = useState(
    localDay()
  );

  const [meal1, setMeal1] = useState("");
  const [meal2, setMeal2] = useState("");
  const [meal3, setMeal3] = useState("");
  const [meal4, setMeal4] = useState("");
  const [meal5, setMeal5] = useState("");
  const [snacks, setSnacks] = useState("");

  const [updateMealPlan] = useUpdateMealPlanMutation();

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const response = await fetch(`/api/user/meal-plan/${currentDate}`);
        
        if (response.ok) {
            const data = await response.json();
            setMeal1(data.meal1 || "");
            setMeal2(data.meal2 || "");
            setMeal3(data.meal3 || "");
            setMeal4(data.meal4 || "");
            setMeal5(data.meal5 || "");
            setSnacks(data.snacks || "");
            
            // Optional: Update local storage with fresh data

        } else {
            // Handle case where no plan exists for this date yet (clear inputs)
            setMeal1("");
            setMeal2("");
            setMeal3("");
            setMeal4("");
            setMeal5("");
            setSnacks("");
        }

      } catch (error) {
        console.error("Fetch meal plan error:", error);
      }
    };

    // FIX 3: Prioritize fetching fresh data. Use localStorage only if you want offline support, 
    // but typically you should fetch on mount to ensure synchronization.
    fetchMealPlan();
  }, [currentDate]); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const mealPlanData = {
        date: currentDate,
        meal1,
        meal2,
        meal3,
        meal4,
        meal5,
        snacks,
      };

      // Save the meal plan to local storage
      localStorage.setItem("mealPlan", JSON.stringify(mealPlanData));

      // FIX 2: Simplified Submit Logic
      // The backend 'updateUserMealPlan' controller handles creation if the plan doesn't exist.
      // We only need to call the update mutation.
      await updateMealPlan(mealPlanData).unwrap();
      
      toast.success("Meal plan updated successfully!");

    } catch (error) {
      toast.error("Failed to save the meal plan.");
      console.error("Save meal plan error:", error);
    }
  };

  return (
    <div>
      <h1>Meal Plan</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="date">
          <Form.Label>Date</Form.Label>
          <Form.Control type="text" value={currentDate} readOnly />
        </Form.Group>

        <Form.Group controlId="meal1">
          <Form.Label>Meal 1 (Breakfast)</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter breakfast"
            value={meal1}
            onChange={(e) => setMeal1(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="meal2">
          <Form.Label>Meal 2 (Lunch)</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter lunch"
            value={meal2}
            onChange={(e) => setMeal2(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="meal3">
          <Form.Label>Meal 3 (Dinner)</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter dinner"
            value={meal3}
            onChange={(e) => setMeal3(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="meal4">
          <Form.Label>Meal 4</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter meal 4"
            value={meal4}
            onChange={(e) => setMeal4(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="meal5">
          <Form.Label>Meal 5</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter meal 5"
            value={meal5}
            onChange={(e) => setMeal5(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="snacks">
          <Form.Label>Snacks</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter snacks"
            value={snacks}
            onChange={(e) => setSnacks(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="my-3">
          Save Plan
        </Button>
      </Form>
    </div>
  );
};

export default MealPlan;