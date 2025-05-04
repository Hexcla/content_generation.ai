import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  Slider,
  Chip,
  Divider,
  Stack,
  InputAdornment,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Fab,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Switch,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  ImageList,
  ImageListItem
} from '@mui/material';
import {
  Description,
  Article,
  Instagram,
  YouTube,
  Email,
  ShoppingCart,
  ContentCopy,
  Download,
  Refresh,
  History,
  Settings,
  Videocam,
  Book,
  AutoAwesome,
  Language,
  Palette,
  BrandingWatermark,
  Speed,
  Psychology
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const contentTypes = [
  { 
    value: 'blog', 
    label: 'Blog Post', 
    icon: <Book />,
    description: 'Generate engaging blog content',
    options: {
      styles: ['Informative', 'Tutorial', 'Opinion', 'Review'],
      lengths: ['Short', 'Medium', 'Long']
    }
  },
  { 
    value: 'article', 
    label: 'Article', 
    icon: <Description />,
    description: 'Create professional articles',
    options: {
      styles: ['News', 'Feature', 'Analysis', 'Opinion'],
      lengths: ['Short', 'Medium', 'Long']
    }
  },
  { 
    value: 'social', 
    label: 'Social Media', 
    icon: <Instagram />,
    description: 'Create social media content',
    options: {
      platforms: ['Instagram', 'Facebook', 'Twitter', 'LinkedIn'],
      types: ['Post', 'Story', 'Carousel', 'Ad']
    }
  },
  { 
    value: 'youtube', 
    label: 'YouTube', 
    icon: <YouTube />,
    description: 'Generate YouTube content',
    options: {
      types: ['Video Script', 'Thumbnail', 'Description', 'Tags'],
      styles: ['Educational', 'Entertainment', 'Tutorial', 'Review']
    }
  },
  { 
    value: 'tiktok', 
    label: 'TikTok', 
    icon: <Videocam />,
    description: 'Create TikTok content',
    options: {
      types: ['Script', 'Caption', 'Hashtags'],
      styles: ['Trending', 'Educational', 'Entertainment']
    }
  },
  { 
    value: 'email', 
    label: 'Email', 
    icon: <Email />,
    description: 'Generate email content',
    options: {
      types: ['Newsletter', 'Marketing', 'Welcome Series', 'Promotional']
    }
  },
  { 
    value: 'product', 
    label: 'Product Description', 
    icon: <ShoppingCart />,
    description: 'Create product descriptions',
    options: {
      styles: ['Professional', 'Casual', 'Luxury', 'Technical']
    }
  }
];

const tones = [
  'Professional',
  'Casual',
  'Friendly',
  'Formal',
  'Humorous',
  'Inspirational',
  'Educational',
];

const ContentDashboard = () => {
  const [contentType, setContentType] = useState('blog');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('Medium');
  const [keywords, setKeywords] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [additionalParams, setAdditionalParams] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [contentHistory, setContentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');
  const navigate = useNavigate();
  const [openAdvancedModal, setOpenAdvancedModal] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [advancedOptions, setAdvancedOptions] = useState({
    generateImage: true,
    alignImageWithText: true,
    contentDepth: 50,
    creativity: 70,
    accuracy: 80,
    brandVoice: 'professional',
    colorScheme: 'modern',
    scrapeSources: false,
    useMetadata: true,
    applyBrandRules: true
  });

  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory]);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await axios.get('http://localhost:5000/api/history');
      if (response.data && response.data.history) {
        setContentHistory(response.data.history);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadHistoryItem = (item) => {
    setContentType(item.content_type);
    setTopic(item.topic);
    setTone(item.tone);
    if (item.keywords && Array.isArray(item.keywords)) {
      setKeywords(item.keywords.join(', '));
    }
    setGeneratedContent(item.content);
    setShowHistory(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const keywordsArray = keywords 
      ? keywords.split(',').map(k => k.trim()).filter(k => k) 
      : [];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await axios.post('http://localhost:5000/api/generate', {
        topic,
        tone: tone.toLowerCase(),
        content_type: contentType,
        keywords: keywordsArray,
        additional_params: {
          ...additionalParams,
          length: length.toLowerCase(),
          generate_image: true // Always generate an image
        }
      }, { 
        signal: controller.signal,
        validateStatus: () => true
      });
      
      clearTimeout(timeoutId);
      
      if (response.status !== 200) {
        // For demonstration, always include an image in the mock content
        const mockContent = `# Sample ${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Content about "${topic}"

This is a sample ${tone.toLowerCase()} content about ${topic}. 
        
In a real environment, this would be generated by the AI based on your inputs.

## Key Points

- First point about ${topic}
- Second relevant point
- Practical applications
- Future considerations

![Generated Image](https://source.unsplash.com/800x400/?${encodeURIComponent(topic)})

*This is demonstration content since the backend server connection failed. Please ensure your Flask backend is running on port 5000.*`;

        setGeneratedContent(mockContent);
        setError("Backend connection failed - displaying sample content. Please ensure your Flask backend is running.");
        setIsLoading(false);
        return;
      }

      if (response.data && response.data.content) {
        if (typeof response.data.content === 'object') {
          setGeneratedContent(JSON.stringify(response.data.content, null, 2));
        } else {
          // Ensure we have an image in the content
          let content = response.data.content;
          if (!content.includes("![")) {
            content += `\n\n![Generated Image](https://source.unsplash.com/800x400/?${encodeURIComponent(topic)})`;
          }
          setGeneratedContent(content);
        }
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your backend server connection.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error: Unable to connect to the backend server. Please ensure your Flask backend is running on port 5000.');
      } else {
        setError(err.response?.data?.error || err.message || 'An error occurred while generating content');
      }
      console.error('Error generating content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${contentType}-content.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleRegenerate = () => {
    handleSubmit({ preventDefault: () => {} });
  };

  const handleContentTypeChange = (event) => {
    setContentType(event.target.value);
    setAdditionalParams({});
  };

  const handleAdditionalParamChange = (param, value) => {
    setAdditionalParams(prev => ({
      ...prev,
      [param]: value
    }));
  };

  const handleOpenAdvancedModal = () => {
    setOpenAdvancedModal(true);
  };

  const handleCloseAdvancedModal = () => {
    setOpenAdvancedModal(false);
  };

  const handleAdvancedOptionChange = (option, value) => {
    setAdvancedOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const handleNextStep = () => {
    setActiveStep(prevStep => Math.min(prevStep + 1, 3));
  };

  const handleBackStep = () => {
    setActiveStep(prevStep => Math.max(prevStep - 1, 0));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const generateAdvancedContent = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      // Always include an image with improved reliability
      setGeneratedContent(`# Advanced AI Generated Content: ${topic}

## Introduction
This content was created using the Advanced AI Generator with custom settings:
- Content Depth: ${advancedOptions.contentDepth}%
- Creativity: ${advancedOptions.creativity}%
- Brand Voice: ${advancedOptions.brandVoice}

## Main Content
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies aliquam, 
est nunc sodales velit, eget faucibus nisl velit eget nunc.

## Conclusion
Thank you for using our Advanced AI Content Generator. This is a mock response -
integrate your multimodal generation API to see real results.

![Generated Image](https://source.unsplash.com/800x400/?${encodeURIComponent(topic || 'ai content')})
`);
      setIsLoading(false);
      handleCloseAdvancedModal();
    }, 2000);
  };

  const renderAdditionalOptions = () => {
    const selectedType = contentTypes.find(type => type.value === contentType);
    if (!selectedType?.options) return null;

    return Object.entries(selectedType.options).map(([category, options]) => (
      <FormControl key={category} fullWidth sx={{ mt: 2 }}>
        <InputLabel>{category.charAt(0).toUpperCase() + category.slice(1)}</InputLabel>
        <Select
          value={additionalParams[category] || ''}
          onChange={(e) => handleAdditionalParamChange(category, e.target.value)}
          label={category.charAt(0).toUpperCase() + category.slice(1)}
        >
          {options.map(option => (
            <MenuItem key={option} value={option.toLowerCase()}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    ));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          AI Content Generator
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AutoAwesome />}
            onClick={handleOpenAdvancedModal}
            sx={{ mr: 2 }}
          >
            Advanced AI Generator
          </Button>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={() => navigate('/settings')}
          >
            Account Settings
          </Button>
        </Box>
      </Box>
      
      <Dialog 
        open={openAdvancedModal} 
        onClose={handleCloseAdvancedModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AutoAwesome color="secondary" sx={{ mr: 1 }} />
            <Typography variant="h5" component="span">Advanced AI Content Generator</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pb: 1, pt: 2 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            <Step>
              <StepLabel>Content Type</StepLabel>
            </Step>
            <Step>
              <StepLabel>Style & Tone</StepLabel>
            </Step>
            <Step>
              <StepLabel>Advanced Options</StepLabel>
            </Step>
            <Step>
              <StepLabel>Generate</StepLabel>
            </Step>
          </Stepper>
          
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>Content Configuration</Typography>
              
              <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab icon={<Book />} label="Text" />
                <Tab icon={<Videocam />} label="Image & Video" />
                <Tab icon={<Language />} label="Social Media" />
              </Tabs>
              
              {activeTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Content Topic"
                      placeholder="What would you like to create content about?"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Content Type</InputLabel>
                      <Select
                        value={contentType}
                        onChange={handleContentTypeChange}
                      >
                        {contentTypes.map(type => (
                          <MenuItem key={type.value} value={type.value}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              {type.icon}
                              <span>{type.label}</span>
                            </Stack>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Tone</InputLabel>
                      <Select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                      >
                        {tones.map(tone => (
                          <MenuItem key={tone} value={tone}>
                            {tone}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography gutterBottom>Content Depth</Typography>
                    <Slider
                      value={advancedOptions.contentDepth}
                      onChange={(e, newValue) => handleAdvancedOptionChange('contentDepth', newValue)}
                      valueLabelDisplay="auto"
                      step={10}
                      marks
                      min={10}
                      max={100}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">Concise</Typography>
                      <Typography variant="caption" color="text.secondary">Comprehensive</Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}
              
              {activeTab === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={advancedOptions.generateImage}
                          onChange={(e) => handleAdvancedOptionChange('generateImage', e.target.checked)}
                        />
                      }
                      label="Generate Images with Content"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Image Description"
                      placeholder="Describe the image you want to generate"
                      disabled={!advancedOptions.generateImage}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl component="fieldset" disabled={!advancedOptions.generateImage}>
                      <FormLabel component="legend">Image Style</FormLabel>
                      <RadioGroup 
                        row 
                        defaultValue="photorealistic"
                      >
                        <FormControlLabel value="photorealistic" control={<Radio />} label="Photorealistic" />
                        <FormControlLabel value="artistic" control={<Radio />} label="Artistic" />
                        <FormControlLabel value="cartoon" control={<Radio />} label="Cartoon" />
                        <FormControlLabel value="sketch" control={<Radio />} label="Sketch" />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={advancedOptions.alignImageWithText}
                          onChange={(e) => handleAdvancedOptionChange('alignImageWithText', e.target.checked)}
                          disabled={!advancedOptions.generateImage}
                        />
                      }
                      label="Contextually align images with text content"
                    />
                  </Grid>
                </Grid>
              )}
              
              {activeTab === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Social Media Platform Targeting
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip label="Instagram" color="primary" variant="outlined" />
                      <Chip label="Twitter/X" color="primary" variant="outlined" />
                      <Chip label="LinkedIn" variant="outlined" />
                      <Chip label="Facebook" variant="outlined" />
                      <Chip label="TikTok" variant="outlined" />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Hashtags"
                      placeholder="Enter relevant hashtags"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Post Type</InputLabel>
                      <Select defaultValue="carousel">
                        <MenuItem value="single">Single Post</MenuItem>
                        <MenuItem value="carousel">Carousel</MenuItem>
                        <MenuItem value="story">Story</MenuItem>
                        <MenuItem value="reel">Reel/Short Video</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
          
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Style & Tone Configuration</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Brand Voice</FormLabel>
                    <RadioGroup 
                      row 
                      value={advancedOptions.brandVoice}
                      onChange={(e) => handleAdvancedOptionChange('brandVoice', e.target.value)}
                    >
                      <FormControlLabel value="professional" control={<Radio />} label="Professional" />
                      <FormControlLabel value="casual" control={<Radio />} label="Casual" />
                      <FormControlLabel value="friendly" control={<Radio />} label="Friendly" />
                      <FormControlLabel value="authoritative" control={<Radio />} label="Authoritative" />
                      <FormControlLabel value="innovative" control={<Radio />} label="Innovative" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Creativity Level</Typography>
                  <Slider
                    value={advancedOptions.creativity}
                    onChange={(e, newValue) => handleAdvancedOptionChange('creativity', newValue)}
                    valueLabelDisplay="auto"
                    step={10}
                    marks
                    min={10}
                    max={100}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">Conservative</Typography>
                    <Typography variant="caption" color="text.secondary">Experimental</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Factual Accuracy</Typography>
                  <Slider
                    value={advancedOptions.accuracy}
                    onChange={(e, newValue) => handleAdvancedOptionChange('accuracy', newValue)}
                    valueLabelDisplay="auto"
                    step={10}
                    marks
                    min={10}
                    max={100}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">Creative Liberty</Typography>
                    <Typography variant="caption" color="text.secondary">Strictly Factual</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Color Scheme</InputLabel>
                    <Select
                      value={advancedOptions.colorScheme}
                      onChange={(e) => handleAdvancedOptionChange('colorScheme', e.target.value)}
                    >
                      <MenuItem value="modern">Modern & Minimal</MenuItem>
                      <MenuItem value="vibrant">Vibrant & Bold</MenuItem>
                      <MenuItem value="corporate">Corporate & Professional</MenuItem>
                      <MenuItem value="pastel">Soft Pastel</MenuItem>
                      <MenuItem value="monochrome">Monochrome</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Advanced Options</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={advancedOptions.scrapeSources}
                        onChange={(e) => handleAdvancedOptionChange('scrapeSources', e.target.checked)}
                      />
                    }
                    label="Scrape web sources for additional context"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reference URLs"
                    placeholder="Enter URLs to scrape for context (optional)"
                    disabled={!advancedOptions.scrapeSources}
                    helperText="Separate multiple URLs with commas"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={advancedOptions.useMetadata}
                        onChange={(e) => handleAdvancedOptionChange('useMetadata', e.target.checked)}
                      />
                    }
                    label="Extract metadata from sources (themes, styles, SEO)"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={advancedOptions.applyBrandRules}
                        onChange={(e) => handleAdvancedOptionChange('applyBrandRules', e.target.checked)}
                      />
                    }
                    label="Apply brand consistency rules to generated content"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      border: '1px dashed', 
                      borderColor: 'grey.400',
                      borderRadius: 1,
                      bgcolor: 'background.paper'
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <Psychology color="primary" sx={{ mr: 1 }} />
                      AI Learning Feedback
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Enable content quality feedback to help improve future generations
                    </Typography>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Share anonymous feedback data"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {activeStep === 3 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h6" gutterBottom>Ready to Generate Multimodal Content</Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Your content will be generated with these advanced settings:
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 2, textAlign: 'left' }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Content Settings</Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    <li>Topic: {topic || 'Not specified'}</li>
                    <li>Type: {contentType}</li>
                    <li>Tone: {tone}</li>
                    <li>Depth: {advancedOptions.contentDepth}%</li>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Style Settings</Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    <li>Brand Voice: {advancedOptions.brandVoice}</li>
                    <li>Creativity: {advancedOptions.creativity}%</li>
                    <li>Accuracy: {advancedOptions.accuracy}%</li>
                    <li>Color Scheme: {advancedOptions.colorScheme}</li>
                  </Box>
                </Grid>
                
                {advancedOptions.generateImage && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>Visual Content</Typography>
                    <Typography variant="body2">
                      Images will be generated to match your text content
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {activeStep > 0 && (
            <Button onClick={handleBackStep}>
              Back
            </Button>
          )}
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep < 3 ? (
            <Button variant="contained" onClick={handleNextStep}>
              Next
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={generateAdvancedContent}
              startIcon={<AutoAwesome />}
            >
              Generate Advanced Content
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Content Generator
            </Typography>
            <form onSubmit={handleSubmit}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Content Type</InputLabel>
                <Select
                  value={contentType}
                  onChange={handleContentTypeChange}
                  label="Content Type"
                >
                  {contentTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {type.icon}
                        <span>{type.label}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                sx={{ mb: 2 }}
                required
              />

              <TextField
                fullWidth
                label="Keywords (comma separated)"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="keyword1, keyword2, keyword3"
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Tone</InputLabel>
                <Select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  label="Tone"
                >
                  {tones.map(tone => (
                    <MenuItem key={tone} value={tone}>
                      {tone}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Length</InputLabel>
                <Select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  label="Length"
                >
                  <MenuItem value="Short">Short</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Long">Long</MenuItem>
                </Select>
              </FormControl>

              {renderAdditionalOptions()}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isLoading}
                sx={{ mt: 2 }}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Generate Content'}
              </Button>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5">Generated Content</Typography>
              <Stack direction="row" spacing={1}>
                <Tooltip title="History">
                  <IconButton onClick={() => setShowHistory(!showHistory)}>
                    <History />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Copy">
                  <IconButton onClick={handleCopyContent} disabled={!generatedContent}>
                    <ContentCopy />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download">
                  <IconButton onClick={handleDownload} disabled={!generatedContent}>
                    <Download />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Regenerate">
                  <IconButton onClick={handleRegenerate} disabled={isLoading}>
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>

            <Drawer
              anchor="right"
              open={showHistory}
              onClose={() => setShowHistory(false)}
              sx={{ 
                '& .MuiDrawer-paper': { 
                  width: { xs: '100%', sm: 400 },
                  p: 2
                } 
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>Content History</Typography>
              
              {historyLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : contentHistory.length === 0 ? (
                <Typography color="text.secondary" align="center">
                  No content history found
                </Typography>
              ) : (
                <List>
                  {contentHistory.map((item) => (
                    <ListItem 
                      key={item.id}
                      button
                      onClick={() => loadHistoryItem(item)}
                      sx={{ mb: 1, border: '1px solid #eee', borderRadius: 1 }}
                    >
                      <ListItemText
                        primary={item.topic || 'Untitled'}
                        secondary={
                          <>
                            <Typography variant="body2" component="span" color="text.secondary">
                              {new Date(item.timestamp).toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Type: {item.content_type.charAt(0).toUpperCase() + item.content_type.slice(1)}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Drawer>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : generatedContent ? (
              <Box sx={{ whiteSpace: 'pre-wrap' }}>
                <ReactMarkdown 
                  components={{
                    img: ({node, ...props}) => (
                      <Box 
                        sx={{
                          my: 2,
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                      >
                        <img 
                          {...props} 
                          style={{ 
                            maxWidth: '100%', 
                            height: 'auto', 
                            display: 'block' 
                          }} 
                        />
                      </Box>
                    )
                  }}
                >
                  {generatedContent}
                </ReactMarkdown>
              </Box>
            ) : (
              <Typography color="text.secondary" align="center" sx={{ p: 4 }}>
                Your generated content will appear here
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContentDashboard; 