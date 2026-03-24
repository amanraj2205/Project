import axios from "axios";


export const fetchGithubRepos = async (username) => {
    try {
        const response = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
        
        
        return response.data.map(repo => ({
            title: repo.name,
            shortDescription: repo.description || null,
            techStack: repo.language || "GitHub",
            githubUrl: repo.html_url,
            demoUrl: repo.homepage || null,
            startDate: repo.created_at ? new Date(repo.created_at) : null,
            endDate: repo.updated_at ? new Date(repo.updated_at) : null,
        }));
    } catch (error) {
        console.error("Error fetching GitHub repos:", error.message);
        throw new Error("Failed to fetch projects from GitHub. Please check your username.");
    }
};
