from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todone.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    tasks = db.relationship('Task', backref='owner', lazy=True)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

@app.route('/')
def index():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get_or_404(session['user_id'])
    active_tasks = Task.query.filter_by(user_id=session['user_id'], completed=False).order_by(Task.date_created).all()
    completed_tasks = Task.query.filter_by(user_id=session['user_id'], completed=True).order_by(Task.date_created).all()
    
    return render_template('index.html', active_tasks=active_tasks, completed_tasks=completed_tasks, username=user.username)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            return redirect(url_for('index'))
        else:
            flash('Invalid username or password')
    
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        existing_user = User.query.filter_by(username=username).first()
        
        if existing_user:
            flash('Username already exists')
        else:
            hashed_password = generate_password_hash(password)
            new_user = User(username=username, password=hashed_password)
            db.session.add(new_user)
            db.session.commit()
            flash('Account created successfully', 'success')
            return redirect(url_for('login'))
    
    return render_template('signup.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('login'))

@app.route('/add_task', methods=['POST'])
def add_task():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    task_content = request.form['content']
    if task_content:
        new_task = Task(content=task_content, user_id=session['user_id'])
        db.session.add(new_task)
        db.session.commit()
    
    return redirect(url_for('index'))

@app.route('/toggle_task/<int:id>')
def toggle_task(id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    task = Task.query.get_or_404(id)
    
    if task.user_id != session['user_id']:
        return redirect(url_for('index'))
    
    task.completed = not task.completed
    db.session.commit()
    
    return redirect(url_for('index'))

@app.route('/update_task/<int:id>', methods=['POST'])
def update_task(id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    task = Task.query.get_or_404(id)
    
    if task.user_id != session['user_id']:
        return redirect(url_for('index'))
    
    task.content = request.form['content']
    db.session.commit()
    
    return redirect(url_for('index'))

@app.route('/clear_completed')
def clear_completed():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    Task.query.filter_by(user_id=session['user_id'], completed=True).delete()
    db.session.commit()
    
    return redirect(url_for('index'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True) 