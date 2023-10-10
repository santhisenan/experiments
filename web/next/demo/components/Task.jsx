import React from "react";

const Task = ({ task }) => {
  return (
    <tr key={task.id}>
      <th>1</th>
      <td>{task.text}</td>
      <td>Quality Control Specialist</td>
    </tr>
  );
};

export default Task;
