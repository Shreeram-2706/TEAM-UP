
const Message = require('../Models/Message');

const sendMessage = async (req, res) => {
  try {
    console.log('Received message data:', req.body); 
    
    const { projectID, senderID, name, message } = req.body;
    
    if (!projectID || !senderID || !name || !message) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    const newMessage = new Message({
      projectID,
      senderID,
      name,
      message
    });

    console.log('Message to save:', newMessage); 
    
    await newMessage.save();

    console.log('Message saved successfully:', newMessage._id); 

    const io = req.app.get('io');
    io.to(projectID).emit('newMessage', newMessage);

    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error('Error saving message:', error); 
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};
const getMessages = async (req, res) => {
  try {
    const { projectID } = req.params;

    if (!projectID) {
      return res.status(400).json({ 
        success: false,
        message: 'Project ID is required' 
      });
    }

    const messages = await Message.find({ projectID }).sort({createdAt:1});

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

module.exports = {
  sendMessage,
  getMessages
};