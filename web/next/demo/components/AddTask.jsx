"use client";

import { useState } from "react";

import { AiOutlinePlus } from "react-icons/ai";
import Modal from "./Modal";

const AddTask = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setModalOpen(true)}
        className="btn btn-primary w-full"
      >
        Add new task <AiOutlinePlus className="ml-2" size={18} />
      </button>
      <Modal modalOpen={modalOpen} setModalOpen={setModalOpen} />
    </div>
  );
};

export default AddTask;
