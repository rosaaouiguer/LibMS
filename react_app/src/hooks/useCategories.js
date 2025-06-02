import { useState, useEffect } from "react";
import axios from "axios";

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          "https://lms-backend-zjt1.onrender.com/api/bookCategory"
        );

        if (res.data.success && Array.isArray(res.data.data)) {
          const mapped = res.data.data.map((cat) => ({
            id: cat._id,
            name: cat.categoryName,
          }));
          setCategories(mapped);
        } else {
          setError("Failed to fetch categories");
        }
      } catch (err) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

export default useCategories;
