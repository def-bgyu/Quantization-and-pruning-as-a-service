import React from 'react';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Tab } from '@mui/material';
import Header from '../components/Header';
import CompletedStats from './CompletedStats';
import RunningStats from './RunningStats';
import OptimizationResults from '../components/OptimizationResults';

function Dashboard() {
    const [value, setValue] = React.useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            <Box>
                <Header />
                <Box sx={{ flexGrow: 1, p: 1 }}>
                    <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChange} aria-label="dashboard tabs" variant="standard">
                                <Tab label="RUNNING" value="1" />
                                <Tab label="COMPLETED" value="2" />
                            </TabList>
                        </Box>
                        <TabPanel value="1">
                            <RunningStats />
                        </TabPanel>
                        <TabPanel value="2">
                            <CompletedStats />
                            <OptimizationResults />
                        </TabPanel>
                    </TabContext>
                </Box>
            </Box>
        </>
    );
}

export default Dashboard;
