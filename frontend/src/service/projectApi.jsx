import api from "./api";


const fetchProjects = async () =>{

    const data = await api.get('/project/all-projects')

    return data.response

    
}