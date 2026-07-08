interface UserAvatarGroupProps {
    users: { id: number; name: string; avatarUrl: string }[];
}

export default function UserAvatarGroup({ users }: UserAvatarGroupProps) {
    return (
        <div className="flex -space-x-2">
            {users.map((user) => (
                <div key={user.id} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold overflow-hidden">
                    <img src={user.avatarUrl} alt={user.name} />
                </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                +5
            </div>
        </div>
    );
}