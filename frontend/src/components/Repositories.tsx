import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { HoverEffect } from "./ui/card-hover-effect"; 

interface Repository {
  name: string;
  description: string | null;
  html_url: string;
  owner: {
    login: string;
  };
}

interface HoverEffectItem {
  title: string;
  description: string;
  link: string;
}

const Repositories = () => {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate();

  useEffect(() => {
    const getRepos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Authentication required. Please log in.");
          navigate("/"); 
          return;
        }

        const response = await axios.get<Repository[]>(
          `${import.meta.env.VITE_APP_BACKEND_BASE_URL}/repos`,
          {
            headers: {
              Authorization: JSON.parse(token), 
            },
          }
        );
        setRepos(response.data); 
      } catch (error) {
        console.error("Failed to fetch repositories:", error);
        toast.error("Failed to load repositories. Please try again.");
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate("/");
        }
      } finally {
        setLoading(false); 
      }
    };

    getRepos();
  }, [navigate]); 

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <img src="/animatedlogogif.gif" alt="Loading repositories..." className="w-80 h-80" />
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-8 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-blue-400 mb-6">
          No Repositories Found
        </h2>
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-xl">
          It looks like you haven't created any repositories yet, or there was an issue fetching them.
        </p>
        <button
          onClick={() => window.open("https://github.com/new", "_blank")}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-colors duration-300 text-lg"
        >
          Create Your First Repository
        </button>
      </div>
    );
  }

  const hoverItems: HoverEffectItem[] = repos.map((repo) => ({
    title: repo.name || "Untitled Repository",
    description: repo.description || "No description available for this repository.",
    link: `/dashboard/${repo.owner?.login || "unknown"}/${repo.name}/pulls`, 
  }));

  return (
    <div className="bg- min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#040404]">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-center text-white mb-8 leading-tight">
          Your <span className="text-[#6C45FF]">Repositories</span>
        </h1>
        <p className="text-xl text-center text-gray-400 mb-16 max-w-3xl mx-auto">
          Explore your coding projects and jump right into their details, or create new ones.
        </p>

        <HoverEffect items={hoverItems} />
      </div>
    </div>
  );
};

export default Repositories;