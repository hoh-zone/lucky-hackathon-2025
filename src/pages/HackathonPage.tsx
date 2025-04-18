import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProjectList from "../components/ProjectList"; // Adjust import path

// Mock data - In a real app, fetch based on objectId
const allMockProjects: { [key: string]: any[] } = {
  "0x123": [
    { id: 1, title: "Hackathon 0x123 - 项目 A" },
    { id: 2, title: "Hackathon 0x123 - 项目 B" },
  ],
  "0x456": [{ id: 3, title: "Hackathon 0x456 - 项目 C" }],
  // Add more mock data for different object IDs as needed
};

// Mock API call function
const fetchProjectsByHackathonId = async (
  hackathonId: string,
): Promise<any[]> => {
  console.log(`Fetching projects for hackathon: ${hackathonId}`);
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return allMockProjects[hackathonId] || []; // Return specific projects or empty array
};

const HackathonPage: React.FC = () => {
  const { objectId } = useParams<{ objectId: string }>();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!objectId) {
      setError("Hackathon ID not found in URL");
      setLoading(false);
      return;
    }

    const loadProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedProjects = await fetchProjectsByHackathonId(objectId);
        setProjects(fetchedProjects);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError("Failed to load projects. Please try again later.");
      }
      setLoading(false);
    };

    loadProjects();
  }, [objectId]); // Re-run effect if objectId changes

  if (loading) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
        Loading projects...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500 dark:text-red-400 mt-8">
        Error: {error}
      </p>
    );
  }

  return (
    <div className="px-4 pt-6">
      {/* You might want to add a title specific to the hackathon */}
      {/* <h1 className="text-3xl font-bold text-center my-4">Hackathon {objectId}</h1> */}
      <ProjectList projects={projects} />
    </div>
  );
};

export default HackathonPage;
