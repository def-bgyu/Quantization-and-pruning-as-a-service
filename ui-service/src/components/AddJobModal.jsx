import AddTaskIcon from '@mui/icons-material/AddTask';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Box, DialogContent, FormControl, FormLabel, Grid } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import Slide from '@mui/material/Slide';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import Select, { components } from 'react-select';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function AddJobModal(props) {
  const { open, handleClose } = props;
  const { register, handleSubmit } = useForm();

  const [exp, setExp] = useState('');
  const [task, setTask] = useState('');
  const [model, setModel] = useState('');

  const task_options = [
    { label: 'Sentiment Classification', value: 'classification' },
    { label: 'Question Answering', value: 'question_answering' },
    { label: 'Summarization', value: 'summarization' },
    { label: 'Machine Translation', value: 'machine_translation' },
  ];

  const model_options = [
    { label: 'Distil Roberta', value: 'Distil Roberta' },
    { label: 'Finbert', value: 'Finbert' },
    { label: 'FinTwitBERT', value: 'FinTwitBERT' },
    { label: 'Sentinet-v1', value: 'Sentinet-v1' },
  ];

  const DropdownIndicator = (props) => {
    return (
      <components.DropdownIndicator {...props}>
        <UploadFileIcon />
      </components.DropdownIndicator>
    );
  };

  const user_id = localStorage.getItem('user_id');

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('exp_name', exp);
    formData.append('task_type', task);
    formData.append('model_name', model);
    formData.append('test_user_file', data['test_user_file'][0]);

    console.log(formData);

    axios
      .request({
        url: `${window._env_.API_URL}/submit-job`,
        method: 'POST',
        headers: {
          'content-type': 'multipart/form-data',
        },
        params: { 'user-id': user_id },
        data: formData,
      })
      .then((response) => {
        console.log('Created', response);
      })
      .catch((error) => {
        console.log('Error Failed', error);
      });

    handleClose();
  };

  return (
    <React.Fragment>
      <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
        <AppBar sx={{ position: 'relative', bgcolor: 'rgb(19, 77, 178)' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Job Details
            </Typography>
            <Button autoFocus variant="contained" color="primary" onClick={handleSubmit(onSubmit)}>
              <AddTaskIcon sx={{ pr: 0.5 }} fontSize="medium" />
              Add Job
            </Button>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <FormControl>
            <FormLabel sx={{ fontSize: 24, pb: 1 }}>Experiment:</FormLabel>
            <Grid container rowSpacing={2} columnSpacing={3} alignItems="center" justifyContent="flex-end">
              {/* Experiment Name */}
              <Grid item xs={6}>
                <Box textAlign="right">
                  <FormLabel sx={{ fontSize: 16 }}>Experiment Name:</FormLabel>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Enter Experiment Name"
                  variant="outlined"
                  size="medium"
                  value={exp}
                  onChange={(e) => setExp(e.target.value)}
                />
              </Grid>

              {/* Task Type */}
              <Grid item xs={6}>
                <Box textAlign="right">
                  <FormLabel sx={{ fontSize: 16 }}>Task Type:</FormLabel>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Select
                  placeholder="Select Task Type"
                  options={task_options}
                  onChange={(e) => setTask(e.value)}
                  components={{ DropdownIndicator }}
                />
              </Grid>

              {/* Model Name */}
              <Grid item xs={6}>
                <Box textAlign="right">
                  <FormLabel sx={{ fontSize: 16 }}>Model Name:</FormLabel>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Select
                  placeholder="Select Model Name"
                  options={model_options}
                  onChange={(e) => setModel(e.value)}
                  components={{ DropdownIndicator }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Upload Test Dataset */}
            <FormLabel sx={{ fontSize: 24, pb: 1 }}>Datasets:</FormLabel>
            <Grid container rowSpacing={2} alignItems="center" justifyContent="flex-end">
              <Grid item xs={6}>
                <Box textAlign="right">
                  <FormLabel sx={{ fontSize: 16 }}>Upload Test Dataset:</FormLabel>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
                  Upload Test Data
                  <input type="file" accept=".csv" hidden {...register('test_user_file')} />
                </Button>
              </Grid>
            </Grid>
          </FormControl>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}

export default AddJobModal;
