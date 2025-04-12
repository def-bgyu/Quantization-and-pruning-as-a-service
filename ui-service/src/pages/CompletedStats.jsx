import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { Button, Grid, IconButton, InputAdornment, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import axiosConfig from '../utils/AxiosConfig';

const CompletedStats = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tableData, setTableData] = useState([]);
  const [bestRunData, setBestRunData] = useState('');

  const user_id = localStorage.getItem("user_id");

  const fetchExpDetails = async () => {
    try {
      const response = (await axiosConfig.get('/prev-runs', { params: { "user-id": user_id } })).data;
      console.log('Response:', response);

      setBestRunData(response?.best_runs[Object.keys(response?.best_runs)[0]]);

      let experimentRunDetails = [];

      Object.keys(response?.runs).forEach((key) => {
        experimentRunDetails.push({
          exp_id: response?.runs[key]?.exp_id,
          exp_name: key,
          model_type: response?.runs[key]?.model_meta_data?.model_name || "Unknown Model",
          status: "Completed",
        });
      });

      setTableData(experimentRunDetails);
      console.log("Completed run table: ", experimentRunDetails);
    } catch (error) {
      console.error('Error fetching experiment details:', error);
    }
  };

  useEffect(() => {
    fetchExpDetails();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredData = tableData.filter((data) =>
    data.exp_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadModelFile = async (exp_id) => {
    try {
      await axiosConfig.request({
        url: `/download-model/${exp_id}`,
        method: 'GET',
        params: { "user-id": user_id },
        responseType: 'blob',
      }).then((response) => {
        const href = URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = href;
        link.setAttribute('download', `model_${exp_id}.zip`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
      });
    } catch (error) {
      console.error('Error downloading model:', error);
    }
  };

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
        <Grid container item xs={6} justifyContent="flex-end">
          <Button startIcon={<RefreshIcon />} onClick={fetchExpDetails}>
            REFRESH
          </Button>
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
                  <TableCell>Download</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ bgcolor: 'lightgray', fontStyle: 'italic' }}>
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((data) => (
                    <TableRow key={data.exp_id} sx={{ backgroundColor: data.exp_id === bestRunData ? 'lightgreen' : 'inherit' }}>
                      <TableCell>{data.exp_name}</TableCell>
                      <TableCell>{data.model_type}</TableCell>
                      <TableCell>{data.status}</TableCell>
                      <TableCell>
                        <CloudDownloadIcon sx={{ color: 'green', cursor: 'pointer' }} onClick={() => downloadModelFile(data.exp_id)} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </div>
  );
};

export default CompletedStats;
