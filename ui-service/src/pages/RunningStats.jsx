import React, { useEffect, useState } from 'react';
import { Button, Grid, IconButton, InputAdornment, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import LoopIcon from '@mui/icons-material/Loop';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddJobModal from '../components/AddJobModal';
import axiosConfig from '../utils/AxiosConfig';

const RunningStats = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tableData, setTableData] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);

  const user_id = localStorage.getItem("user_id");

  const fetchRunningJobs = async () => {
    try {
      const response = await axiosConfig.get('/current-run', { params: { "user-id": user_id } });
      console.log('Response:', response);

      setTableData(response?.["current-run"]?.map((data) => ({
        exp_id: data.exp_id,
        exp_name: data.exp_name || "Unnamed Experiment",
        model_type: data?.model_meta_data?.model_name || "Unknown Model",
        status: data.training ? "Running" : "Completed",
      })) || []);
    } catch (error) {
      console.error('Error fetching running jobs:', error);
    }
  };

  useEffect(() => {
    fetchRunningJobs();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleOpenDialog = () => {
    setOpenAddModal(true);
  };

  const handleCloseDialog = () => {
    setOpenAddModal(false);
  };

  const filteredData = tableData.filter((data) =>
    data.exp_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Grid container spacing={2} pt={2} pb={2}>
        <Grid item xs={6}>
          <TextField
            label="Search Experiment"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={6} container justifyContent="flex-end">
          <Button variant="outlined" color="secondary" startIcon={<AddIcon />} onClick={handleOpenDialog}>
            Add Job
          </Button>
          <IconButton onClick={fetchRunningJobs}>
            <RefreshIcon />
          </IconButton>
        </Grid>
      </Grid>

      <Grid container>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Experiment Name</TableCell>
                  <TableCell>Model Type</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ bgcolor: 'lightgray', fontStyle: 'italic' }}>
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((data) => (
                    <TableRow key={data.exp_id}>
                      <TableCell>{data.exp_name}</TableCell>
                      <TableCell>{data.model_type}</TableCell>
                      <TableCell>
                        {data.status === "Running" ? (
                          <LoopIcon
                            sx={{
                              animation: 'spin 2s linear infinite',
                              '@keyframes spin': {
                                '0%': { transform: 'rotate(360deg)' },
                                '100%': { transform: 'rotate(0deg)' },
                              },
                            }}
                          />
                        ) : (
                          <CheckCircleOutlineIcon sx={{ color: 'green' }} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Add Job Modal */}
      <AddJobModal open={openAddModal} handleClose={handleCloseDialog} />
    </div>
  );
};

export default RunningStats;
