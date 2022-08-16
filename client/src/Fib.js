import React from "react";
import axios from "axios";

const Fib = () => {
  const [seenIndexes, setSeenIndexes] = React.useState([]);
  const [values, setValues] = React.useState({});
  const [index, setIndex] = React.useState("");

  const getIndexes = async () => {
    const response = await axios.get("/api/values/all");
    setSeenIndexes(response.data);
  };

  const getValues = async () => {
    const response = await axios.get("/api/values/current");
    setValues(response.data);
  };

  React.useEffect(() => {
    getIndexes();
    getValues();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    await axios.post("/api/values", { index });
    setIndex("");
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <label>Enter your index:</label>
        <input
          value={index}
          onChange={(event) => setIndex(event.target.value)}
        />
        <button>Submit</button>
      </form>

      <h3>Indexes I have seen:</h3>
      {seenIndexes.map(({ number }) => number).join(", ")}

      <h3>Calculated Values:</h3>
      {Object.entries(values).map(([key, value]) => (
        <div key={key}>
          For index {key} I calculated {value}
        </div>
      ))}
    </div>
  );
};

export { Fib };
