const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const uuid = require('uuid');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

app.use(express.static('public'));
app.use(morgan('common'));

mongoose.connect('mongodb://localhost:27017/finalDB', 
{ useNewUrlParser: true, useUnifiedTopology: true });


// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my movie app.');
});

// Get all users
app.get('/users', async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get('/users/:Username', async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// #1 Return a list of ALL movies
app.get('/movies', async (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// #2 Return data about a single movie by title 
app.get('/movies/:Title', async (req, res) => {
  Movies.findOne({Title: req.params.Title})
    .then((movie) => {
      res.status(200).json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// # 3 Return data about a genre (description) by name
app.get('/movies/genre/:genreName', async (req, res) => {
  Movies.findOne({'Genre.Name':req.params.genreName})
    .then((movie) => {
      res.status(200).json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// #4 Return data about a director (bio) by name
app.get('/movies/directors/:directorName', async (req, res) => {
  Movies.findOne({'Director.Name':req.params.directorName})
    .then((movie) => {
      res.status(200).json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// #5 Allow new users to register
app.post('/users', async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});
// app.post('/users', [
//   check('Username', 'Username is required').isLength({min:5}),
//   check('Username', 'Username contains non alphanumeric chacters - not allowed').isAlphanumeric(),
//   check('Password', 'Password is required').not().isEmpty(),
//   check('Email', 'Email does not appear to be valid').isEmail()
// ], (req, res) => {
//   let errors = validationResult(req);
  
//   if (!errors.isEmpty()) {
//     return res.status(422).json({errors: errors.array()});
//   }

//   let hashedPassword = Users.hashPassword(req.body.Password);

//   Users.findOne({ Username: req.body.Username })
//     .then((user) => {
//       if (user) {
//         return res.status(400).send(req.body.Username + ' already exists');
//       } else {
//         Users
//           .create({
//             Username: req.body.Username,
//             Password: hashedPassword,
//             Email: req.body.Email,
//             Birthday: req.body.Birthday
//           })
//           .then((user) =>{res.status(201).json(user)})
//           .catch((error) => {
//             console.error(error);
//             res.status(500).send('Error: ' + error);
//           })
//         }
//     })
//     .catch((error) => {
//       console.error(error);
//       res.status(500).send('Error: ' + error);
//     });
// });

// #6 Allow users to update their user info (username, password, email, date of birth)
app.put('/users/:Username', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  })
});

// app.put('/users/:Username', [
//   check('Username', 'Username is required').isLength({min:5}),
//   check('Username', 'Username contains non alphanumeric chacters - not allowed').isAlphanumeric(),
//   check('Password', 'Password is required').not().isEmpty(),
//   check('Email', 'Email does not appear to be valid').isEmail()
//   ], 
//   passport.authenticate('jwt', { session: false }), 
//   (req, res) => {
//     let errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(422).json({errors: errors.array()});
//     }

//     let hashedPassword = Users.hashPassword(req.body.Password);
    
//     if(req.user.Username !== req.params.Username){
//       return res.status(400).send('Permission denied.');
//     }

//     Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
//       {
//         Username: req.body.Username,
//         Password: hashedPassword,
//         Email: req.body.Email,
//         Birthday: req.body.Birthday
//       }
//     },
//     { new: true }) 
//     .then(updatedUser => {
//         res.json(updatedUser);
//     })
//     .catch(err => {
//       console.error(err);
//       res.status(500).send('Error: ' + err);
//     });
// });

// #7 Allow users to add a movie to their list of favorites
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
//   Users.findOneAndUpdate(
//     { Username: req.params.Username },
//     { $push: { FavoriteMovies: req.params.MovieID } },
//     { new: true }
//   )
//     .then(updatedUser => {
//       res.json(updatedUser);
//     })
//     .catch(err => {
//       console.error(err);
//       res.status(500).send('Error: ' + err);
//     });
// });

// #8 Allow users to remove a movie from their list of favorites
app.delete('/users/:Username/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
//   Users.findOneAndUpdate(
//     { Username: req.params.Username },
//     { $pull: { FavoriteMovies: req.params.MovieID } },
//     { new: true }
//   )
//     .then(updatedUser => {
//       res.json(updatedUser);
//     })
//     .catch(err => {
//       console.error(err);
//       res.status(500).send('Error: ' + err);
//     });
// });

// #9 Allow existing users to deregister (Delete a user by name)
app.delete('/users/:Username', async (req, res) => {
  await Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
//   Users.findOneAndRemove({ Username: req.params.Username })
//     .then((user) => {
//       if (!user) {
//         res.status(400).send(req.params.Username + ' was not found');
//       } else {
//         res.status(200).send(req.params.Username + ' was deleted.');
//       }
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).send('Error: ' + err);
//     });
// });


// Create error-handling
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('something is not working!');
});



// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});