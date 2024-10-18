import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Header } from '../components/Header';
import { url } from '../const';
import PropTypes from 'prop-types';
import './home.scss';

export const Home = () => {
  const [isDoneDisplay, setIsDoneDisplay] = useState('todo'); // todo->未完了 done->完了
  const [lists, setLists] = useState([]);
  const [selectListId, setSelectListId] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [cookies] = useCookies();
  const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value);
  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data);
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`);
      });
  }, []);

  useEffect(() => {
    const listId = lists[0]?.id;
    if (typeof listId !== 'undefined') {
      setSelectListId(listId);
      axios
        .get(`${url}/lists/${listId}/tasks`, {
          headers: {
            authorization: `Bearer ${cookies.token}`,
          },
        })
        .then((res) => {
          setTasks(res.data.tasks);
        })
        .catch((err) => {
          setErrorMessage(`タスクの取得に失敗しました。${err}`);
        });
    }
  }, [lists]);

  const handleSelectList = (id) => {
    setSelectListId(id);
    axios
      .get(`${url}/lists/${id}/tasks`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setTasks(res.data.tasks);
      })
      .catch((err) => {
        setErrorMessage(`タスクの取得に失敗しました。${err}`);
      });
  };
  return (
    <div>
      <Header />
      <main className="taskList">
        <p className="error-message">{errorMessage}</p>
        <div>
          <div className="list-header">
            <h2>リスト一覧</h2>
            <div className="list-menu">
              <p>
                <Link to="/list/new" className="list-make">
                  リスト新規作成
                </Link>
              </p>
              <p>
                <Link
                  to={`/lists/${selectListId}/edit`}
                  className="list-tap-edit"
                >
                  選択中のリストを編集
                </Link>
              </p>
            </div>
          </div>
          <ul className="list-tab" role="tablist">
            {lists.map((list, index) => {
              const isActive = list.id === selectListId;

              const handleKeyDown = (e) => {
                const tabs = document.querySelectorAll('[role="tab"]');
                if (e.key === 'Enter') {
                  handleSelectList(list.id);
                } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                  const nextIndex =
                    e.key === 'ArrowRight'
                      ? (index + 1) % lists.length
                      : (index - 1 + lists.length) % lists.length;
                  tabs[nextIndex].focus();
                }
              };

              return (
                <li
                  key={index}
                  role="tab"
                  tabIndex={0}
                  className={`list-tab-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectList(list.id)}
                  onKeyDown={handleKeyDown}
                >
                  {list.title}
                </li>
              );
            })}
          </ul>
          <div className="tasks">
            <div className="tasks-header">
              <h2>タスク一覧</h2>
              <p>
                <Link to="/task/new" className="task-make">
                  タスク新規作成
                </Link>
              </p>
            </div>
            <div className="display-select-wrapper">
              <select
                onChange={handleIsDoneDisplayChange}
                className="display-select"
              >
                <option value="todo">未完了</option>
                <option value="done">完了</option>
              </select>
            </div>
            <Tasks
              tasks={tasks}
              selectListId={selectListId}
              isDoneDisplay={isDoneDisplay}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

// 表示するタスク
const Tasks = (props) => {
  const { tasks, selectListId, isDoneDisplay } = props;
  if (tasks === null) return <></>;

  if (isDoneDisplay == 'done') {
    return (
      <ul>
        {tasks
          .filter((task) => {
            return task.done === true;
          })
          .map((task, key) => (
            <li key={key} className="task-item">
              <Link
                to={`/lists/${selectListId}/tasks/${task.id}`}
                className="task-item-link"
              >
                {task.title}
                <br />
                {task.done ? '完了' : '未完了'}
              </Link>
            </li>
          ))}
      </ul>
    );
  }

  const RemainingTime = (limit) => {
    const limitDate = new Date(limit);
    const now = new Date();

    const rest = limitDate - now;

    if (rest <= 0) {
      return '期限切れ';
    }

    const days = Math.floor(rest / (1000 * 60 * 60) / 24);
    const hours = Math.floor((rest / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((rest % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}日 ${hours}時間 ${minutes}分`;
  };

  return (
    <ul>
      {tasks
        .filter((task) => {
          return task.done === false;
        })
        .map((task, key) => (
          <li key={key} className="task-item">
            <Link
              to={`/lists/${selectListId}/tasks/${task.id}`}
              className="task-item-link"
            >
              {task.title}
              <br />
              {task.done ? '完了' : '未完了'}
              <br />
              {task.limit && (
                <span className="task-limit">
                  期限日時:
                  {new Date(task.limit).toLocaleString('ja-JP', {
                    timeZone: 'UTC',
                  })}
                  <br />
                  残り時間： {RemainingTime(task.limit)}
                </span>
              )}
            </Link>
          </li>
        ))}
    </ul>
  );
};

Tasks.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      done: PropTypes.bool.isRequired,
    }),
  ).isRequired,
  selectListId: PropTypes.number.isRequired,
  isDoneDisplay: PropTypes.oneOf(['todo', 'done']).isRequired,
};
