type Activity = {
  id: number;
  message: string;
  date: string;
};

type RecentActivityProps = {
  activities: Activity[];
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <section>
      <h2>Recent Activity</h2>

      {activities.length === 0 ? (
        <p>No recent activity.</p>
      ) : (
        <div className="activity-list">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-dot" />

              <div>
                <p>{activity.message}</p>
                <small>{activity.date}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
