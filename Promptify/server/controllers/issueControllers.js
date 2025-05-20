import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const currentIssuesPath = path.resolve(__dirname, '../data/knownIssuesData/current_issues.json');
const archivedIssuesPath = path.resolve(__dirname, '../data/knownIssuesData/archive_issues.json');
const currentIssues = fs.readFileSync(currentIssuesPath, 'utf8');
const archivedIssues = fs.readFileSync(archivedIssuesPath, 'utf8');
const currentIssuesData = JSON.parse(currentIssues);
const archivedIssuesData = JSON.parse(archivedIssues);

export const getAllIssues = async (req, res) => {
    try {
        const issues = [...currentIssuesData, ...archivedIssuesData];        
        issues.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (issues.length === 0) {
            return res.status(200).json({ message: 'No issues found' });
        } else {
            return res.status(200).json(issues);
        };
    } catch (error) {
        console.error('Error fetching all issues:', error);
        res.status(500).json({ error: 'An unexpected error occurred when fetching all issues' });
    };
};

export const getOneIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const issues = [...currentIssuesData, ...archivedIssuesData];
        const issue = issues.find(issue => issue.id === issueId);

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        } else {
            return res.status(200).json(issue);
        };
    } catch (error) {
        console.error('Error fetching one issue:', error);
        res.status(500).json({ error: 'An unexpected error occurred when fetching the issue' });
    };
};

export const getAllCurrentIssues = async (req, res) => {
    try {
        const issues = [...currentIssuesData];
        issues.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (issues.length === 0) {
            return res.status(404).json({ message: 'No issues found' });
        } else {
            return res.status(200).json(issues);
        };
    } catch (error) {
        console.error('Error fetching all issues:', error);
        res.status(500).json({ error: 'An unexpected error occurred when fetching all current issues' });
    };
};

export const getAllArchivedIssues = async (req, res) => {
    try {
        const issues = [...archivedIssuesData];
        issues.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (issues.length === 0) {
            return res.status(404).json({ message: 'No issues found' });
        } else {
            return res.status(200).json(issues);
        };
    } catch (error) {
        console.error('Error fetching all issues:', error);
        res.status(500).json({ error: 'An unexpected error occurred when fetching all archived issues' });
    };
};

export const submitIssue = async (req, res) => {
    try {
        const { title, description, status, approved } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        };

        const newIssue = {
            id: uuidv4(),
            title,
            description,
            date: new Date().toISOString(),
            status: status || 'unapproved',
            approved: approved || false
        };

        currentIssuesData.push(newIssue);
        fs.writeFileSync(currentIssuesPath, JSON.stringify(currentIssuesData, null, 2));

        return res.status(201).json(newIssue);
    } catch (error) {
        console.error('Error submitting issue:', error);
        res.status(500).json({ error: 'An unexpected error occurred when submitting the issue' });
    };
};

export const approveIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const issueIndex = currentIssuesData.findIndex(issue => issue.id === issueId);

        if (issueIndex === -1) {
            return res.status(404).json({ message: 'Issue not found' });
        };

        const issue = currentIssuesData[issueIndex];
        issue.status = 'approved';
        issue.approved = true;

        currentIssuesData.splice(issueIndex, 1);
        currentIssuesData.push(issue);
        fs.writeFileSync(currentIssuesPath, JSON.stringify(currentIssuesData, null, 2));

        return res.status(200).json(issue);
    } catch (error) {
        console.error('Error approving issue:', error);
        res.status(500).json({ error: 'An unexpected error occurred when approving the issue' });
    };
};

export const archiveIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const issueIndex = currentIssuesData.findIndex(issue => issue.id === issueId);

        if (issueIndex === -1) {
            return res.status(404).json({ message: 'Issue not found' });
        };

        const issue = {
            id: currentIssuesData[issueIndex].id,
            title: currentIssuesData[issueIndex].title,
            description: currentIssuesData[issueIndex].description,
            status: "archived",
            submitted_date: currentIssuesData[issueIndex].date,
            date: new Date().toISOString(),
            archive_reason: req.body.archive_reason || 'No reason provided'
        };
        archivedIssuesData.push(issue);
        currentIssuesData.splice(issueIndex, 1);

        fs.writeFileSync(currentIssuesPath, JSON.stringify(currentIssuesData, null, 2));
        fs.writeFileSync(archivedIssuesPath, JSON.stringify(archivedIssuesData, null, 2));

        return res.status(200).json(issue);
    } catch (error) {
        console.error('Error archiving issue:', error);
        res.status(500).json({ error: 'An unexpected error occurred when archiving the issue' });
    };
};

export const deleteIssue = async (req, res) => {
    try {
        const { issueId } = req.params;

        const issues = [...currentIssuesData, ...archivedIssuesData];        
        issues.sort((a, b) => new Date(b.date) - new Date(a.date));

        const issueExists = issues.some(issue => issue.id === issueId);
        if (!issueExists) {
            return res.status(404).json({ message: 'Issue not found' });
        };

        if (currentIssuesData.some(issue => issue.id === issueId)) {
            const issueIndex = currentIssuesData.findIndex(issue => issue.id === issueId);
            currentIssuesData.splice(issueIndex, 1);
            fs.writeFileSync(currentIssuesPath, JSON.stringify(currentIssuesData, null, 2));
        } else {
            const issueIndex = archivedIssuesData.findIndex(issue => issue.id === issueId);
            archivedIssuesData.splice(issueIndex, 1);
            fs.writeFileSync(archivedIssuesPath, JSON.stringify(archivedIssuesData, null, 2));
        };

        return res.status(200).json({ message: 'Issue deleted successfully' });
    } catch (error) {
        console.error('Error deleting issue:', error);
        res.status(500).json({ error: 'An unexpected error occurred when deleting the issue' });
    };
};

export const archiveAllCurrent = async (req, res) => {
    try {
        if (currentIssuesData.length === 0) {
            return res.status(404).json({ message: 'No issues found' });
        };

        const archivedIssues = currentIssuesData.map(issue => ({
            id: issue.id,
            title: issue.title,
            description: issue.description,
            status: "archived",
            submitted_date: issue.date,
            date: new Date().toISOString(),
            archive_reason: req.body.archive_reason || 'No reason provided'
        }));
        archivedIssuesData.push(...archivedIssues);
        currentIssuesData.length = 0;

        fs.writeFileSync(currentIssuesPath, JSON.stringify(currentIssuesData, null, 2));
        fs.writeFileSync(archivedIssuesPath, JSON.stringify(archivedIssuesData, null, 2));

        return res.status(200).json({ message: 'All current issues archived successfully' });
    } catch (error) {
        console.error('Error archiving all current issues:', error);
        res.status(500).json({ error: 'An unexpected error occurred when archiving all current issues' });
    };
};

export const deleteAllCurrent = async (req, res) => {
    try {
        if (currentIssuesData.length === 0) {
            return res.status(404).json({ message: 'No issues found' });
        };

        currentIssuesData.length = 0;
        fs.writeFileSync(currentIssuesPath, JSON.stringify(currentIssuesData, null, 2));

        return res.status(200).json({ message: 'All current issues deleted successfully' });
    } catch (error) {
        console.error('Error deleting all current issues:', error);
        res.status(500).json({ error: 'An unexpected error occurred when deleting all current issues' });
    };
};

export const deleteAllArchived = async (req, res) => {
    try {
        if (archivedIssuesData.length === 0) {
            return res.status(404).json({ message: 'No issues found' });
        };

        archivedIssuesData.length = 0;
        fs.writeFileSync(archivedIssuesPath, JSON.stringify(archivedIssuesData, null, 2));

        return res.status(200).json({ message: 'All archived issues deleted successfully' });
    } catch (error) {
        console.error('Error deleting all archived issues:', error);
        res.status(500).json({ error: 'An unexpected error occurred when deleting all archived issues' });
    };
};