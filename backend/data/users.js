import bcrypt from 'bcryptjs';

const users = [
{
    name: 'Mohit Dambale',
    email: 'mohitdambale@email.com',
    password: bcrypt.hashSync('123456',10),
},
{
    name: 'Narendra Modi',
    email: 'Narendra Modi@email.com',
    password: bcrypt.hashSync('123456',10),
}
]


export default users;