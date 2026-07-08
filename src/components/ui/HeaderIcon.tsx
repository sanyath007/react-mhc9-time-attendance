import { type HeaderIconProps } from '../../lib/types'
import { cn } from '../../lib/utils/tailwindcss'

const HeaderIcon = ({ Icon, cssClass }: HeaderIconProps) => {
    return <Icon className={cn("w-8 h-8 max-md:w-6 max-md:h-6 text-white", cssClass)} />
}

export default HeaderIcon