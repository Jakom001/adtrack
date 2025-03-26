import Company from "../models/companyModel";
import { companyValidator } from "../middlewares/validator";

const allCompanies = async (req, res) => {
    try {
        const companies = await Company.find();
        res.status(200).json({message: "companies", data:companies });
    } catch (error) {
        res.status(500).json({ Error:"Error retrieving messages",  error: error.message });
    }
}

const postCompany = async (req, res) => {
    const {companyName,
        industry,
        website,
        logo,
        email,
        phone,
        address,
        city,
        country,
        description,} = req.body;

    const { error } = companyValidator.validate({
        companyName,
        industry,
        website,
        logo,
        email,
        phone,
        address,
        city,
        country,
        description,});
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    try {
        const company = new Company(
            {companyName,
                industry,
                website,
                logo,
                email,
                phone,
                address,
                city,
                country,
                description,}
        );
        const result = await company.save();
        res.status(201).json({ message: "Company created successfully", data: result });
    } catch (error) {
        res.status(500).json({ Error: "Error creating company", error: error.message });
    }
}

const getCompanyById = async (req, res) => {
    const { id } = req.params;
    try {
        const company = await Company
            .findById(id);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }
        res.status(200).json({ message: "Company found", data: company });
    }
    catch (error) {
        res.status(500).json({ Error: "Error retrieving company", error: error.message });
    }
}

const updateCompany = async (req, res) => {
    const { id } = req.params;
    const { companyName,
        industry,
        website,
        logo,
        email,
        phone,
        address,
        city,
        country,
        description,} = req.body;
    const { error } = companyValidator.validate({
        companyName,
        industry,
        website,
        logo,
        email,
        phone,
        address,
        city,
        country,
        description,});
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    try {
        const company = await Company
            .findById(id);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }
        company.companyName = companyName;
        company.industry = industry;
        company.website = website;
        company.logo = logo;
        company.email = email;
        company.phone = phone;
        company.address = address;
        company.city = city;
        company.country = country;
        company.description = description;
        const result = await company.save();
        res.status(200).json({ message: "Company updated successfully", data: result });
    } catch (error) {
        res.status(500).json({ Error: "Error updating company", error: error.message });
    }
}

const deleteCompany = async (req, res) => {
    const { id } = req.params;
    try {
        const company = await Company
            .findById(id);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }
        await company.remove();
        res.status(200).json({ message: "Company deleted successfully" });
    } catch (error) {
        res.status(500).json({ Error: "Error deleting company", error: error.message });
    }
}

export { allCompanies, postCompany, getCompanyById, updateCompany, deleteCompany };